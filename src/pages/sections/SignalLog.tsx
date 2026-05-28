import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../state/AuthContext'
import { fetchTeamSignals, fetchAssetClasses, createTeamSignal, archiveTeamSignal, deleteTeamSignal, createAssetClass } from '../../api/teamSignals'
import { CITIES } from '../../data/mock/cities'
import { Skeleton } from '../../components/common/Skeleton'
import { autoClassify, fetchUrlMeta, isCampsiteSignal } from '../../lib/autoClassify'
import { createCampsite } from '../../api/campsitePipeline'
import type { TeamSignal, CityKey, Vertical, ThesisTag } from '../../types'

// ── Constants ─────────────────────────────────────────────
const THESIS_TAGS: { value: ThesisTag; label: string }[] = [
  { value: 'undervalued_coastal', label: 'Undervalued Coastal' },
  { value: 'nordic_wellness_demand', label: 'Nordic Wellness Demand' },
  { value: 'consolidation_play', label: 'Consolidation Play' },
  { value: 'climate_migration', label: 'Climate Migration' },
  { value: 'emerging_asset_class', label: 'Emerging Asset Class' },
]

const VERTICALS: { value: Vertical | 'BOTH'; label: string }[] = [
  { value: 'COASTAL_HOTELS', label: 'Coastal Hotels' },
  { value: 'PREMIUM_SAUNAS', label: 'Premium Saunas' },
  { value: 'BOTH', label: 'Both' },
]

const FILTER_OPTIONS = ['All', 'Boutique Hotel', 'Waterfront Property', 'Private Villa', 'Camping Ground', 'Premium Sauna', 'Mixed-Use'] as const

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Add Signal Modal ──────────────────────────────────────
interface AddModalProps {
  open: boolean
  onClose: () => void
  assetClasses: string[]
  onRefreshClasses: () => void
}

const AddSignalModal: React.FC<AddModalProps> = ({ open, onClose, assetClasses, onRefreshClasses }) => {
  const { email } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    url: '',
    title: '',
    description: '',
    asset_class: '',   // intentionally empty — auto-classify fills it; user can also pick manually
    city: '' as string,
    vertical: '' as string,
    thesis_tag: '' as string,
    tip_source: '',
    notes: '',
  })
  const [newAssetClass, setNewAssetClass] = useState('')
  const [showNewAssetClass, setShowNewAssetClass] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [addedToPipeline, setAddedToPipeline] = useState(false)
  const [extractedMeta, setExtractedMeta] = useState<{ images: string[]; finnkode: string | null; priceNok: number; location: string; region: string; translated: boolean } | null>(null)

  // Universal URL handler — works for Finn.no, news sites, any URL
  const handleUrlPaste = async (url: string) => {
    setForm(f => ({ ...f, url }))
    setAddedToPipeline(false)
    setExtractedMeta(null)

    // Need at least a plausible URL
    if (!url.startsWith('http') || url.length < 12) return

    setFetching(true)
    setError('')
    try {
      const meta = await fetchUrlMeta(url)
      if (!meta || meta.error) {
        // Silent fail — user fills manually
        setFetching(false)
        return
      }

      // Auto-classify on extracted content
      const classification = autoClassify(meta.title, meta.description)

      // Build description string
      let descParts: string[] = []
      if (meta.priceNok > 0) descParts.push(`Asking: NOK ${meta.priceNok.toLocaleString('no-NO')}`)
      if (meta.location) descParts.push(`Location: ${meta.location}`)
      if (meta.description) descParts.push(meta.description)
      const builtDesc = descParts.join('\n').slice(0, 800)

      setExtractedMeta({
        images: meta.images,
        finnkode: meta.finnkode,
        priceNok: meta.priceNok,
        location: meta.location,
        region: meta.region,
        translated: meta.translated ?? false,
      })

      setForm(f => ({
        ...f,
        title: meta.title || f.title,
        description: f.description || builtDesc,
        asset_class: classification.asset_class && assetClasses.includes(classification.asset_class) ? classification.asset_class : f.asset_class,
        vertical: (classification.vertical || f.vertical) as string,
        thesis_tag: classification.thesis_tag || f.thesis_tag,
        tip_source: f.tip_source || meta.siteName,
      }))
    } catch {
      // Silent fail
    } finally {
      setFetching(false)
    }
  }

  // Auto-classify when title changes
  const handleTitleChange = (title: string) => {
    setForm(f => {
      const updated = { ...f, title }
      const c = autoClassify(title, f.description)
      // Always update asset_class when we find a keyword match
      if (c.asset_class && assetClasses.includes(c.asset_class)) updated.asset_class = c.asset_class
      // Only set vertical/thesis if user hasn't manually chosen one yet
      if (c.vertical && !f.vertical) updated.vertical = c.vertical as string
      if (c.thesis_tag && !f.thesis_tag) updated.thesis_tag = c.thesis_tag
      return updated
    })
  }

  const createMut = useMutation({
    mutationFn: createTeamSignal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamSignals'] })
      // Close/reset is handled by handleSubmit so we can run campsite dual-write first
    },
    onError: (err: Error) => setError(err.message),
  })

  const addClassMut = useMutation({
    mutationFn: createAssetClass,
    onSuccess: (ac) => {
      onRefreshClasses()
      setForm(f => ({ ...f, asset_class: ac.name }))
      setNewAssetClass('')
      setShowNewAssetClass(false)
    },
    onError: (err: Error) => setError(err.message),
  })

  const resetForm = () => {
    setForm({ url: '', title: '', description: '', asset_class: '', city: '', vertical: '', thesis_tag: '', tip_source: '', notes: '' })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.asset_class) { setError('Asset class is required'); return }
    setError('')

    try {
      // 1 — Save to Signal Log
      await createMut.mutateAsync({
        url: form.url || undefined,
        title: form.title.trim(),
        description: form.description || undefined,
        asset_class: form.asset_class,
        city: (form.city || undefined) as CityKey | undefined,
        vertical: (form.vertical || undefined) as Vertical | 'BOTH' | undefined,
        thesis_tag: (form.thesis_tag || undefined) as ThesisTag | undefined,
        tip_source: form.tip_source || undefined,
        submitted_by: email ?? 'unknown',
        notes: form.notes || undefined,
      })

      // 2 — Dual-write to Campsite Pipeline if the asset class is Camping Ground,
      // or if the keyword sniffer detects campsite language (catches English-language
      // entries where the explicit class was left blank).
      if (form.asset_class === 'Camping Ground' || isCampsiteSignal(form.title, form.description)) {
        try {
          await createCampsite({
            finnkode: extractedMeta?.finnkode || undefined,
            url: form.url || undefined,
            title: form.title.trim(),
            description: form.description || undefined,
            price_nok: extractedMeta?.priceNok || undefined,
            location: extractedMeta?.location || undefined,
            region: extractedMeta?.region || undefined,
            images: extractedMeta?.images || [],
            added_by: email ?? 'unknown',
            scraped_at: new Date().toISOString(),
          })
          queryClient.invalidateQueries({ queryKey: ['campsites'] })
          setAddedToPipeline(true)
          // Show banner for 2 s then close
          setTimeout(() => { onClose(); resetForm() }, 2200)
        } catch {
          // Campsite write failed silently — signal is already saved
          onClose()
          resetForm()
        }
      } else {
        onClose()
        resetForm()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save signal')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto border border-[var(--border)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add Signal</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="text-sm text-[var(--alert)] bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          {/* URL */}
          <label className="flex flex-col gap-1">
            <span className="eyebrow">URL {fetching && <span className="text-[var(--accent-secondary)] ml-2 normal-case tracking-normal">Fetching listing...</span>}</span>
            <input
              type="url"
              placeholder="Paste any URL — Finn.no listing, news article, LinkedIn post..."
              value={form.url}
              onChange={e => handleUrlPaste(e.target.value)}
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
            />
            {extractedMeta?.translated && (
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--accent-secondary)] mt-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Auto-translated from Norwegian
              </span>
            )}
          </label>

          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="eyebrow">Title *</span>
            <input
              type="text"
              placeholder="e.g. Campingplass ved sjøen, Vestfold — NOK 10M"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
              required
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="eyebrow">Description / Notes</span>
            <textarea
              rows={3}
              placeholder="Paste the relevant excerpt, context, or your take on why this matters..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
            />
          </label>

          {/* Row: Asset Class + City */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Asset Class *</span>
              <div className="flex gap-1">
                <select
                  value={form.asset_class}
                  onChange={e => setForm(f => ({ ...f, asset_class: e.target.value }))}
                  className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                >
                  <option value="">— Auto-detect or select</option>
                  {assetClasses.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewAssetClass(!showNewAssetClass)}
                  className="px-2 py-2 rounded-lg border border-[var(--border)] text-[var(--accent-primary)] hover:bg-[var(--surface-alt)] text-sm font-bold leading-none"
                  title="Add new asset class"
                >+</button>
              </div>
              {showNewAssetClass && (
                <div className="flex gap-1 mt-1">
                  <input
                    type="text"
                    placeholder="New class name"
                    value={newAssetClass}
                    onChange={e => setNewAssetClass(e.target.value)}
                    className="flex-1 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  />
                  <button
                    type="button"
                    onClick={() => newAssetClass.trim() && addClassMut.mutate(newAssetClass.trim())}
                    className="btn-primary text-xs px-3"
                    disabled={addClassMut.isPending}
                  >Add</button>
                </div>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="eyebrow">City (optional)</span>
              <select
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              >
                <option value="">— Not city-specific</option>
                {CITIES.map(c => <option key={c.key} value={c.key}>{c.name}, {c.country}</option>)}
              </select>
            </label>
          </div>

          {/* Row: Vertical + Thesis Tag */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Vertical</span>
              <select
                value={form.vertical}
                onChange={e => setForm(f => ({ ...f, vertical: e.target.value }))}
                className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              >
                <option value="">— Select</option>
                {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="eyebrow">Thesis Pillar</span>
              <select
                value={form.thesis_tag}
                onChange={e => setForm(f => ({ ...f, thesis_tag: e.target.value }))}
                className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              >
                <option value="">— Select</option>
                {THESIS_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
          </div>

          {/* Tip Source */}
          <label className="flex flex-col gap-1">
            <span className="eyebrow">Source</span>
            <input
              type="text"
              placeholder="e.g. Finn.no, broker call, Andy tip, news article"
              value={form.tip_source}
              onChange={e => setForm(f => ({ ...f, tip_source: e.target.value }))}
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
            />
          </label>

          {/* Internal Notes */}
          <label className="flex flex-col gap-1">
            <span className="eyebrow">Internal Notes</span>
            <textarea
              rows={2}
              placeholder="Anything else — pricing context, contact info, next steps..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
            />
          </label>

          {/* Campsite pipeline confirmation banner */}
          {addedToPipeline && (
            <div className="flex items-center gap-2.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Added to Campsite Pipeline</strong> — this listing will appear in your acquisition board.</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || addedToPipeline}>
              {createMut.isPending ? 'Saving...' : 'Save Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Signal Row ────────────────────────────────────────────
const SignalRow: React.FC<{ signal: TeamSignal; onArchive: (id: string) => void; onDelete: (signal: TeamSignal) => void }> = ({ signal, onArchive, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cityMeta = signal.city ? CITIES.find(c => c.key === signal.city) : null
  const thesisLabel = THESIS_TAGS.find(t => t.value === signal.thesis_tag)?.label

  return (
    <div className="px-4 py-3.5 hover:bg-[var(--surface-alt)]/40 transition cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-3">
        {/* Asset class badge */}
        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-primary)] shrink-0 mt-0.5">
          {signal.asset_class}
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)] leading-snug">{signal.title}</span>
            <span className="text-[10px] text-[var(--text-muted)] shrink-0 mt-0.5">{timeAgo(signal.submitted_at)}</span>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {cityMeta && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{cityMeta.name}</span>
            )}
            {signal.vertical && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent-secondary)]">
                {signal.vertical === 'BOTH' ? 'Both' : signal.vertical === 'COASTAL_HOTELS' ? 'Hotels' : 'Saunas'}
              </span>
            )}
            {thesisLabel && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent-mid)]">{thesisLabel}</span>
            )}
            {signal.tip_source && (
              <span className="text-[10px] text-[var(--text-muted)]">via {signal.tip_source}</span>
            )}
            <span className="text-[10px] text-[var(--text-muted)]">by {signal.submitted_by.split('@')[0]}</span>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 ml-[calc(0.5rem+68px)] flex flex-col gap-2">
          {signal.description && (
            <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{signal.description}</p>
          )}
          {signal.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--accent-primary)] underline hover:no-underline"
              onClick={e => e.stopPropagation()}
            >
              {signal.url.length > 80 ? signal.url.slice(0, 80) + '...' : signal.url}
            </a>
          )}
          {signal.notes && (
            <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">{signal.notes}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <button
              className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline"
              onClick={e => { e.stopPropagation(); onArchive(signal.id) }}
            >
              Archive
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-[10px] text-[var(--alert)]">Permanently delete?</span>
                <button
                  className="text-[10px] uppercase tracking-widest text-[var(--alert)] font-semibold hover:underline"
                  onClick={e => { e.stopPropagation(); onDelete(signal) }}
                >
                  Yes, delete
                </button>
                <button
                  className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:underline"
                  onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                className="text-[10px] uppercase tracking-widest text-[var(--alert)] hover:underline"
                onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Signal Log Page ───────────────────────────────────────
export const SignalLog: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const signalsQ = useQuery({
    queryKey: ['teamSignals'],
    queryFn: fetchTeamSignals,
    staleTime: 30_000, // refresh every 30s since it's user-generated
  })

  const classesQ = useQuery({
    queryKey: ['assetClasses'],
    queryFn: fetchAssetClasses,
    staleTime: 5 * 60 * 1000,
  })

  const archiveMut = useMutation({
    mutationFn: archiveTeamSignal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSignals'] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteTeamSignal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSignals'] }),
    onError: (err: Error) => console.error('Delete failed:', err.message),
  })

  const assetClassNames = useMemo(() => classesQ.data?.map(ac => ac.name) ?? [], [classesQ.data])

  const filtered = useMemo(() => {
    let list = signalsQ.data ?? []
    if (filter !== 'All') list = list.filter(s => s.asset_class === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tip_source?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
      )
    }
    return list
  }, [signalsQ.data, filter, search])

  // Stats
  const total = signalsQ.data?.length ?? 0
  const thisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return (signalsQ.data ?? []).filter(s => new Date(s.submitted_at).getTime() >= weekAgo).length
  }, [signalsQ.data])

  const byClass = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of signalsQ.data ?? []) {
      counts[s.asset_class] = (counts[s.asset_class] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [signalsQ.data])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Signal Capture</span>
          <h1 className="text-2xl font-semibold mt-1">Signal Log</h1>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Add Signal
        </button>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="eyebrow">Total Signals</span>
          <div className="text-3xl font-semibold text-[var(--text-primary)] mt-2">{total}</div>
        </div>
        <div className="card p-4">
          <span className="eyebrow">This Week</span>
          <div className="text-3xl font-semibold text-[var(--accent-primary)] mt-2">{thisWeek}</div>
        </div>
        <div className="card p-4 col-span-2">
          <span className="eyebrow">By Asset Class</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {byClass.length === 0 && <span className="text-xs text-[var(--text-muted)]">No signals yet</span>}
            {byClass.map(([cls, count]) => (
              <span key={cls} className="text-xs text-[var(--text-primary)]">
                <span className="font-semibold">{count}</span> <span className="text-[var(--text-muted)]">{cls}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {['All', ...assetClassNames].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest transition ${
                filter === f ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search signals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
        />
      </div>

      {/* Signal list */}
      <div className="card divide-y divide-[var(--border)]">
        {signalsQ.isLoading ? (
          <Skeleton className="h-64" />
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {total === 0 ? 'No signals captured yet. Click "Add Signal" to start building your intelligence feed.' : 'No signals match your filter.'}
            </p>
          </div>
        ) : (
          filtered.map(s => (
            <SignalRow key={s.id} signal={s} onArchive={id => archiveMut.mutate(id)} onDelete={s => deleteMut.mutate(s.id)} />
          ))
        )}
      </div>

      <AddSignalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        assetClasses={assetClassNames}
        onRefreshClasses={() => queryClient.invalidateQueries({ queryKey: ['assetClasses'] })}
      />
    </div>
  )
}
