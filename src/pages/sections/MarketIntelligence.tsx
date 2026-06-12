import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../../state/AppContext'
import { useAuth } from '../../state/AuthContext'
import {
  fetchMarketNews, updateMarketNews, triggerNewsRefresh,
  fetchCapitalFlow, createDeal, deleteDeal,
  DEAL_SUBSECTORS, MarketNewsItem, NewDeal,
} from '../../api/marketIntel'
import { fetchTrends } from '../../api/trends'
import { Skeleton } from '../../components/common/Skeleton'
import { STALE_TIMES } from '../../config/api'

const fmtEur = (n: number | null): string => {
  if (n === null) return 'Undisclosed'
  if (n >= 1_000_000_000) return `€${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  return `€${n.toLocaleString()}`
}

const fmtDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const TAG_LABELS: Record<string, string> = {
  'sauna-norge': 'Sauna · NO',
  'sauna-nordic': 'Sauna · Nordic',
  'camping-norge': 'Camping · NO',
  'camping-ma': 'Camping M&A',
  'wellness-ma': 'Wellness M&A',
  'coastal-hospitality': 'Coastal',
}

const EMPTY_DRAFT: NewDeal = { event_date: '', investor: '', target: '', deal_eur: null, subsector: 'Thermal & Sauna', source_url: null, notes: null }

// ── Add / track deal form ─────────────────────────────────
const DealForm: React.FC<{
  draft: NewDeal
  onChange: (d: NewDeal) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
}> = ({ draft, onChange, onSave, onCancel, saving, error }) => {
  const set = (k: keyof NewDeal, v: string) => onChange({ ...draft, [k]: k === 'deal_eur' ? (Number(v) || null) : v })
  const valid = draft.event_date && draft.investor.trim() && draft.target.trim()
  const input = 'border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30'
  return (
    <div className="card p-4 border-l-4 border-l-[var(--accent-primary)] flex flex-col gap-2">
      <span className="eyebrow">Track Deal</span>
      <div className="grid grid-cols-4 gap-2">
        <input type="date" value={draft.event_date} onChange={e => set('event_date', e.target.value)} className={input} />
        <input placeholder="Investor / Acquirer" value={draft.investor} onChange={e => set('investor', e.target.value)} className={input} />
        <input placeholder="Target" value={draft.target} onChange={e => set('target', e.target.value)} className={input} />
        <input placeholder="Deal EUR (blank = undisclosed)" value={draft.deal_eur ?? ''} onChange={e => set('deal_eur', e.target.value)} className={input} />
        <select value={draft.subsector} onChange={e => set('subsector', e.target.value)} className={`${input} uppercase tracking-widest text-[10px]`}>
          {DEAL_SUBSECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="Source URL" value={draft.source_url ?? ''} onChange={e => set('source_url', e.target.value)} className={`${input} col-span-2`} />
        <input placeholder="Notes" value={draft.notes ?? ''} onChange={e => set('notes', e.target.value)} className={input} />
      </div>
      {error && <p className="text-xs text-alert">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-secondary text-xs">Cancel</button>
        <button onClick={onSave} disabled={!valid || saving} className="btn-primary text-xs disabled:opacity-50">{saving ? 'Saving…' : 'Save Deal'}</button>
      </div>
    </div>
  )
}

export const MarketIntelligence: React.FC = () => {
  const { city } = useApp()
  const { email } = useAuth()
  const queryClient = useQueryClient()
  const [subsector, setSubsector] = useState('All')
  const [tagFilter, setTagFilter] = useState('All')
  const [draft, setDraft] = useState<NewDeal | null>(null)
  const [promoteNewsId, setPromoteNewsId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const flowQ = useQuery({ queryKey: ['capitalflow-live', city], queryFn: () => fetchCapitalFlow(city), staleTime: 60_000 })
  const newsQ = useQuery({ queryKey: ['market-news'], queryFn: fetchMarketNews, staleTime: 60_000 })
  const trendsQ = useQuery({ queryKey: ['trends', city], queryFn: () => fetchTrends(city), staleTime: STALE_TIMES.static })

  const refreshMut = useMutation({
    mutationFn: triggerNewsRefresh,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['market-news'] }),
  })

  const saveDealMut = useMutation({
    mutationFn: async (deal: NewDeal) => {
      await createDeal({ ...deal, created_by: email ?? null })
      if (promoteNewsId) await updateMarketNews(promoteNewsId, { promoted: true })
    },
    onSuccess: () => {
      setDraft(null)
      setPromoteNewsId(null)
      queryClient.invalidateQueries({ queryKey: ['capitalflow-live'] })
      queryClient.invalidateQueries({ queryKey: ['market-news'] })
    },
  })

  const deleteDealMut = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      setConfirmDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['capitalflow-live'] })
    },
  })

  const hideNewsMut = useMutation({
    mutationFn: (id: string) => updateMarketNews(id, { archived: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['market-news'] }),
  })

  const events = flowQ.data?.events ?? []
  const liveFlow = flowQ.data?.live ?? false
  const news = newsQ.data?.items ?? []
  const liveNews = newsQ.data?.live ?? false

  const filteredEvents = useMemo(
    () => (subsector === 'All' ? events : events.filter(e => e.subsector === subsector)),
    [events, subsector],
  )

  // Real 90-day window — the old build hard-coded this sum (|| true bug)
  const ninetyDayTotal = useMemo(() => {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
    return events
      .filter(e => new Date(e.event_date).getTime() >= cutoff)
      .reduce((s, e) => s + (e.deal_eur ?? 0), 0)
  }, [events])

  const newsTags = useMemo(() => ['All', ...Array.from(new Set(news.map(n => n.query_tag).filter(Boolean) as string[]))], [news])
  const filteredNews = useMemo(
    () => (tagFilter === 'All' ? news : news.filter(n => n.query_tag === tagFilter)),
    [news, tagFilter],
  )

  const startPromote = (item: MarketNewsItem) => {
    setPromoteNewsId(item.id)
    setDraft({
      ...EMPTY_DRAFT,
      event_date: item.published_at ? item.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      source_url: item.url,
      notes: item.title,
    })
  }

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">Market Intelligence</span>
        <h1 className="text-2xl font-semibold mt-1">Capital Flow &amp; Sector News</h1>
      </div>

      {draft && (
        <DealForm
          draft={draft}
          onChange={setDraft}
          onSave={() => saveDealMut.mutate(draft)}
          onCancel={() => { setDraft(null); setPromoteNewsId(null) }}
          saving={saveDealMut.isPending}
          error={saveDealMut.isError ? (saveDealMut.error as Error).message : null}
        />
      )}

      <section className="grid grid-cols-12 gap-5 items-start">
        {/* ── Capital flow tracker ── */}
        <div className="col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Capital Flow Tracker</span>
              {liveFlow ? (
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-success/15 text-success">Tracked</span>
              ) : (
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-alert/15 text-alert">Illustrative — run migration 008</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">90-day tracked: <span className="text-accent-primary font-semibold">{fmtEur(ninetyDayTotal)}</span></span>
              {liveFlow && !draft && (
                <button onClick={() => setDraft({ ...EMPTY_DRAFT, event_date: new Date().toISOString().slice(0, 10) })} className="btn-primary text-xs">+ Add Deal</button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {['All', ...DEAL_SUBSECTORS].map(s => (
              <button
                key={s}
                onClick={() => setSubsector(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest transition ${
                  subsector === s ? 'bg-accent-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="card divide-y divide-border">
            {flowQ.isLoading ? (
              <Skeleton className="h-72" />
            ) : filteredEvents.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                {liveFlow
                  ? 'No tracked deals yet. Promote a headline from Sector News or add one manually.'
                  : 'No events in this sub-sector.'}
              </div>
            ) : (
              filteredEvents.map(e => (
                <div key={e.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center group">
                  <span className="col-span-2 text-[11px] text-text-muted">{fmtDate(e.event_date)}</span>
                  <div className="col-span-4 min-w-0">
                    <span className="text-sm font-medium block truncate">{e.investor}</span>
                    <span className="text-xs text-text-muted truncate block">→ {e.target}</span>
                  </div>
                  <span className="col-span-2 text-[10px] uppercase tracking-widest text-accent-primary">{e.subsector}</span>
                  <span className="col-span-2 text-right text-sm font-semibold text-accent-primary">{fmtEur(e.deal_eur)}</span>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {e.source_url && (
                      <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-text-muted hover:text-accent-primary">src ↗</a>
                    )}
                    {liveFlow && (confirmDeleteId === e.id ? (
                      <span className="flex gap-1">
                        <button onClick={() => deleteDealMut.mutate(e.id)} className="text-[10px] text-alert font-semibold">Delete?</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-text-muted">No</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(e.id)} className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 hover:text-alert transition">remove</button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Sector news (live, weekly cron) ── */}
        <div className="col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Sector News</span>
              {liveNews && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-success/15 text-success">Live · Weekly</span>}
            </div>
            <button
              onClick={() => refreshMut.mutate()}
              disabled={refreshMut.isPending}
              className="btn-secondary text-xs disabled:opacity-50"
            >
              {refreshMut.isPending ? 'Harvesting…' : 'Refresh Now'}
            </button>
          </div>

          {refreshMut.isError && <p className="text-xs text-alert">{(refreshMut.error as Error).message}</p>}
          {refreshMut.isSuccess && <p className="text-xs text-success">Harvested {refreshMut.data.harvested} headlines.</p>}

          {newsTags.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {newsTags.map(t => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest transition ${
                    tagFilter === t ? 'bg-accent-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'
                  }`}
                >
                  {t === 'All' ? 'All' : TAG_LABELS[t] ?? t}
                </button>
              ))}
            </div>
          )}

          <div className="card divide-y divide-border max-h-[640px] overflow-y-auto">
            {newsQ.isLoading ? (
              <Skeleton className="h-72" />
            ) : !liveNews ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                Sector news activates once migration 008 is applied and the weekly harvest has run.
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                No headlines yet — hit Refresh Now to run the first harvest.
              </div>
            ) : (
              filteredNews.map(n => (
                <div key={n.id} className="px-4 py-3">
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium leading-snug text-text-primary hover:text-accent-primary transition block">
                    {n.title} ↗
                  </a>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {n.query_tag && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary">{TAG_LABELS[n.query_tag] ?? n.query_tag}</span>}
                    <span className="text-[10px] text-text-muted">{n.source ?? 'Unknown source'} · {fmtDate(n.published_at)}</span>
                    {n.title_original && <span className="text-[9px] uppercase tracking-widest text-text-muted">translated</span>}
                    <span className="flex-1" />
                    {n.promoted ? (
                      <span className="text-[9px] uppercase tracking-widest text-success">Tracked ✓</span>
                    ) : (
                      <button onClick={() => startPromote(n)} className="text-[10px] text-accent-primary hover:underline">Track as deal</button>
                    )}
                    <button onClick={() => hideNewsMut.mutate(n.id)} className="text-[10px] text-text-muted hover:text-alert">hide</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Trend signals (still editorial) ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="eyebrow">Trend Signals</span>
          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">Editorial · Illustrative</span>
        </div>
        {trendsQ.isLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {trendsQ.data?.map(t => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium leading-snug">{t.name}</span>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-lg font-semibold text-accent-primary">{t.momentum}</span>
                    <span className="text-[9px] uppercase tracking-widest text-text-muted">momentum</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{t.insight}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-alt text-accent-primary">
                    {t.vertical === 'BOTH' ? 'Both Verticals' : t.vertical === 'COASTAL_HOTELS' ? 'Coastal Hotels' : 'Premium Saunas'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-text-muted">to mainstream: {t.timeToMainstream}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
