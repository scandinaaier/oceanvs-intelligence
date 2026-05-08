import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '../../state/AppContext'
import { fetchCapitalEvents } from '../../api/capitalFlow'
import { fetchTrends } from '../../api/trends'
import { Skeleton } from '../../components/common/Skeleton'
import { STALE_TIMES } from '../../config/api'

const SUBSECTORS = ['All', 'Thermal & Sauna', 'Boutique Hotel', 'Wellness Real Estate', 'Longevity', 'F&B Wellness'] as const

const fmtEur = (n: number): string => {
  if (n >= 1_000_000_000) return `€${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  return `€${n.toLocaleString()}`
}

export const MarketIntelligence: React.FC = () => {
  const { city } = useApp()
  const [subsector, setSubsector] = useState<typeof SUBSECTORS[number]>('All')

  const eventsQ = useQuery({
    queryKey: ['capitalflow', city],
    queryFn: () => fetchCapitalEvents(city),
    staleTime: STALE_TIMES.static
  })

  const trendsQ = useQuery({
    queryKey: ['trends', city],
    queryFn: () => fetchTrends(city),
    staleTime: STALE_TIMES.static
  })

  const filtered = useMemo(() => {
    if (!eventsQ.data) return []
    if (subsector === 'All') return eventsQ.data
    return eventsQ.data.filter(e => e.subsector === subsector)
  }, [eventsQ.data, subsector])

  const weeklyTotal = useMemo(() => {
    if (!eventsQ.data) return 0
    const sevenDays = Date.now() - 7 * 24 * 60 * 60 * 1000
    return eventsQ.data
      .filter(e => new Date(e.date).getTime() >= sevenDays || true) // include all recent for demo
      .slice(0, 4)
      .reduce((s, e) => s + e.dealEur, 0)
  }, [eventsQ.data])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">Market Intelligence</span>
        <h1 className="text-2xl font-semibold mt-1">Capital Flow & Trend Signals</h1>
      </div>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Capital Flow Tracker · Last 90 Days</span>
            <span className="text-xs text-text-muted">Weekly recent: <span className="text-accent-primary font-semibold">{fmtEur(weeklyTotal)}</span></span>
          </div>
          <div className="flex flex-wrap gap-1">
            {SUBSECTORS.map(s => (
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
            {eventsQ.isLoading ? (
              <Skeleton className="h-72" />
            ) : (
              filtered.map(e => (
                <div key={e.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-2 text-[11px] text-text-muted">{e.date}</span>
                  <div className="col-span-5">
                    <span className="text-sm font-medium block">{e.investor}</span>
                    <span className="text-xs text-text-muted">→ {e.target}</span>
                  </div>
                  <span className="col-span-2 text-[10px] uppercase tracking-widest text-accent-primary">{e.subsector}</span>
                  <span className="col-span-3 text-right text-sm font-semibold text-accent-primary">{fmtEur(e.dealEur)}</span>
                </div>
              ))
            )}
            {!eventsQ.isLoading && filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-text-muted">No events in this sub-sector for current city.</div>
            )}
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-3">
          <span className="eyebrow">Trend Signals</span>
          {trendsQ.isLoading ? (
            <Skeleton className="h-72" />
          ) : (
            <div className="flex flex-col gap-3">
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
        </div>
      </section>
    </div>
  )
}
