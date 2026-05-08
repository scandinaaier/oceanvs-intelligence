import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllOperators } from '../../api/operators'
import { Skeleton } from '../../components/common/Skeleton'
import { CITIES } from '../../data/mock/cities'
import { STALE_TIMES } from '../../config/api'
import type { Operator } from '../../types'

const fmtEur = (n: number): string => {
  if (n >= 1_000_000_000) return `€${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  return `€${n.toLocaleString()}`
}

const MULTIPLES = [4, 5, 6, 7, 8] as const
const TARGET_VALUATION = 220_000_000 // internal target — never displayed

export const PortfolioBuilder: React.FC = () => {
  const opsQ = useQuery({
    queryKey: ['all-ops'],
    queryFn: fetchAllOperators,
    staleTime: STALE_TIMES.static
  })

  const activeRollupOps = useMemo(() => {
    return (opsQ.data ?? []).filter(o => {
      const m = CITIES.find(c => c.key === o.city)
      return m?.tier === 'ACTIVE_ROLLUP'
    })
  }, [opsQ.data])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [multiple, setMultiple] = useState<number>(6)

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const chosen: Operator[] = useMemo(() => activeRollupOps.filter(o => selected.has(o.id)), [activeRollupOps, selected])

  const totals = useMemo(() => {
    const askMin = chosen.reduce((s, o) => s + (o.askingPriceMin ?? 0), 0)
    const askMax = chosen.reduce((s, o) => s + (o.askingPriceMax ?? 0), 0)
    const ebitda = chosen.reduce((s, o) => s + (o.estEbitda ?? 0), 0)
    const valuation = ebitda * multiple
    const ebitdaCoastal = chosen.filter(o => o.vertical === 'COASTAL_HOTELS').reduce((s, o) => s + (o.estEbitda ?? 0), 0)
    const ebitdaSauna = chosen.filter(o => o.vertical === 'PREMIUM_SAUNAS').reduce((s, o) => s + (o.estEbitda ?? 0), 0)
    const coastalPct = ebitda > 0 ? (ebitdaCoastal / ebitda) * 100 : 0
    const saunaPct = ebitda > 0 ? (ebitdaSauna / ebitda) * 100 : 0
    const targetPct = Math.min(100, (valuation / TARGET_VALUATION) * 100)
    return { askMin, askMax, ebitda, valuation, coastalPct, saunaPct, targetPct }
  }, [chosen, multiple])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">Portfolio Builder</span>
        <h1 className="text-2xl font-semibold mt-1">Deal-Stacking · Active Rollup Cities</h1>
      </div>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-7 flex flex-col gap-3">
          <span className="eyebrow">Opportunity List · {activeRollupOps.length} assets</span>
          {opsQ.isLoading ? (
            <Skeleton className="h-[600px]" />
          ) : (
            <div className="card max-h-[640px] overflow-y-auto divide-y divide-border">
              {activeRollupOps.map(o => {
                const isOn = selected.has(o.id)
                const cityMeta = CITIES.find(c => c.key === o.city)!
                return (
                  <label
                    key={o.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer transition ${isOn ? 'bg-surface-alt' : 'hover:bg-surface-alt/40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(o.id)}
                      className="col-span-1 mt-1 accent-[var(--accent-primary)]"
                    />
                    <div className="col-span-4">
                      <span className="text-sm font-medium block">{o.name}</span>
                      <span className="text-xs text-text-muted">{cityMeta.name} · {o.vertical === 'COASTAL_HOTELS' ? 'Coastal Hotels' : 'Premium Saunas'}</span>
                    </div>
                    <div className="col-span-3 text-xs">
                      <span className="text-text-muted block">Asking</span>
                      <span className="font-medium">{fmtEur(o.askingPriceMin!)} – {fmtEur(o.askingPriceMax!)}</span>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className="text-text-muted block">EBITDA</span>
                      <span className="font-medium">{fmtEur(o.estEbitda!)}</span>
                    </div>
                    <div className="col-span-1 text-center text-xs">
                      <span className="text-text-muted block">Coastal</span>
                      <span className="font-medium">{o.coastalRating}/5</span>
                    </div>
                    <div className="col-span-1 text-center text-xs">
                      <span className="text-text-muted block">LMI Fit</span>
                      <span className="font-semibold text-accent-primary">{o.lmiFit}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div className="col-span-5">
          <div className="card p-5 sticky top-[120px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Portfolio Calculator</span>
              <button
                onClick={() => setSelected(new Set())}
                className="text-[11px] text-text-muted hover:text-alert transition"
              >
                Reset selection
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-accent-primary">{chosen.length}</span>
              <span className="text-sm text-text-muted">{chosen.length === 1 ? 'asset' : 'assets'} selected</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-alt">
                <span className="text-[10px] uppercase tracking-widest text-text-muted block">Acquisition Cost</span>
                <span className="text-base font-semibold mt-1 block">
                  {chosen.length > 0 ? `${fmtEur(totals.askMin)} – ${fmtEur(totals.askMax)}` : '—'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt">
                <span className="text-[10px] uppercase tracking-widest text-text-muted block">Combined EBITDA</span>
                <span className="text-base font-semibold mt-1 block">
                  {chosen.length > 0 ? fmtEur(totals.ebitda) : '—'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-2">EV / EBITDA Multiple</span>
              <div className="flex gap-1">
                {MULTIPLES.map(m => (
                  <button
                    key={m}
                    onClick={() => setMultiple(m)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                      multiple === m ? 'bg-accent-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-accent-primary/30 bg-accent-primary/5">
              <span className="text-[10px] uppercase tracking-widest text-text-muted block">Implied Group Valuation</span>
              <span className="text-2xl font-semibold text-accent-primary mt-1 block">
                {chosen.length > 0 ? fmtEur(totals.valuation) : '—'}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-widest text-text-muted">Target Valuation Index</span>
                <span className="text-sm font-semibold text-accent-primary">{Math.round(totals.targetPct)}% of target</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface-alt overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${totals.targetPct}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-2">EBITDA Mix by Vertical</span>
              {totals.ebitda > 0 ? (
                <>
                  <div className="flex h-2 rounded-full overflow-hidden bg-surface-alt">
                    <div className="h-full bg-accent-primary" style={{ width: `${totals.coastalPct}%` }} />
                    <div className="h-full bg-accent-secondary" style={{ width: `${totals.saunaPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                    <span><span className="inline-block w-2 h-2 rounded-full bg-accent-primary mr-1" />Coastal Hotels {Math.round(totals.coastalPct)}%</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-accent-secondary mr-1" />Premium Saunas {Math.round(totals.saunaPct)}%</span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-text-muted">Select assets to see split.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
