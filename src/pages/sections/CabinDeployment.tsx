import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCampsiteTargets } from '../../api/rollup'
import { Skeleton } from '../../components/common/Skeleton'
import { TargetDetailModal } from '../../components/rollup/TargetDetailModal'
import { StagePill, SeedModeBanner, Stat, FilterChip, FilterSelect } from '../../components/rollup/shared'

// Sauna Club deck benchmarks (June 2026): €45k build per cabin,
// €60k/yr revenue at <60% utilization, ~€100k potential at 80% +
// upsells, payback under 12 months, +20 locations in 18 months,
// platform vertical targets >€10M consolidated revenue in 5 years.
const DECK = {
  buildEur: 45_000,
  revLowEur: 60_000,
  revHighEur: 100_000,
  locations18mo: 20,
  platformTarget5yrEur: 10_000_000,
}

const fmtEur = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `€${(n / 1_000).toFixed(0)}k`
  return `€${Math.round(n)}`
}

const SliderRow: React.FC<{
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}> = ({ label, value, min, max, step, display, onChange }) => (
  <div>
    <div className="flex items-baseline justify-between mb-1">
      <span className="text-[9px] uppercase tracking-widest text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-accent-primary">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-[var(--accent-primary)]"
    />
  </div>
)

export const CabinDeployment: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [countyFilter, setCountyFilter] = useState('All')
  const [maxDist, setMaxDist] = useState('any')
  const [swimOnly, setSwimOnly] = useState(false)

  // Calculator state — defaults straight from the deck
  const [cabins, setCabins] = useState(DECK.locations18mo)
  const [buildCost, setBuildCost] = useState(DECK.buildEur)
  const [revPerCabin, setRevPerCabin] = useState(DECK.revLowEur)
  const [marginPct, setMarginPct] = useState(75)

  const q = useQuery({ queryKey: ['rollup', 'campsites'], queryFn: fetchCampsiteTargets, staleTime: 30_000 })
  const targets = q.data?.targets ?? []
  const seedMode = q.data?.source === 'seed'

  // Deployment whitespace: Norwegian waterfront campsites with no
  // sauna today — the partner sites where a cabin lands fastest.
  const whitespace = useMemo(
    () => targets.filter(t => t.country === 'NO' && t.is_waterfront && !t.has_sauna),
    [targets],
  )
  const selected = whitespace.find(t => t.id === selectedId)

  const counties = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of whitespace) if (t.county) counts[t.county] = (counts[t.county] || 0) + 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [whitespace])

  const filtered = useMemo(() => {
    let list = [...whitespace]
    if (countyFilter !== 'All') list = list.filter(t => t.county === countyFilter)
    if (maxDist !== 'any') list = list.filter(t => t.city_dist_km !== null && t.city_dist_km <= Number(maxDist))
    if (swimOnly) list = list.filter(t => t.has_swimming)
    return list.sort((a, b) => (a.city_dist_km ?? 9999) - (b.city_dist_km ?? 9999))
  }, [whitespace, countyFilter, maxDist, swimOnly])

  // Unit economics
  const capex = cabins * buildCost
  const annualRevenue = cabins * revPerCabin
  const annualContribution = annualRevenue * (marginPct / 100)
  const paybackMonths = annualContribution > 0 ? (capex / annualContribution) * 12 : Infinity
  const cabinsForTarget = Math.ceil(DECK.platformTarget5yrEur / revPerCabin)
  const fiveYearContribution = annualContribution * 5 - capex

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">Sauna Vertical · Deployment Model</span>
        <h1 className="text-2xl font-semibold mt-1">Cabin Deployment</h1>
        <p className="text-sm text-text-muted mt-1 max-w-[720px]">
          Where new cabins land fastest: Norwegian waterfront campsites with no sauna infrastructure today.
          Partner-site whitespace from the registry, priced against the deck&apos;s unit economics.
        </p>
      </div>

      {seedMode && <SeedModeBanner />}

      {/* Whitespace stats */}
      <section className="grid grid-cols-4 gap-4">
        <Stat label="Deployment Whitespace" value={whitespace.length} accent sub="NO waterfront sites without sauna" />
        <Stat label="Swim-Ready Sites" value={whitespace.filter(t => t.has_swimming).length} sub="cold plunge on the doorstep" />
        <Stat label="Within 30km of a City" value={whitespace.filter(t => t.city_dist_km !== null && t.city_dist_km <= 30).length} sub="day-trip demand radius" />
        <Stat label="Counties Covered" value={counties.length} sub="distribution across Norway" />
      </section>

      <div className="grid grid-cols-2 gap-4">
        {/* Unit economics calculator */}
        <div className="card p-5 flex flex-col gap-4">
          <div>
            <span className="eyebrow">Unit Economics</span>
            <h2 className="text-base font-semibold mt-1">Deployment Calculator</h2>
          </div>

          <SliderRow label="Cabins Deployed" value={cabins} min={1} max={100} step={1} display={`${cabins}`} onChange={setCabins} />
          <SliderRow label="Build Cost / Cabin" value={buildCost} min={30_000} max={70_000} step={1_000} display={fmtEur(buildCost)} onChange={setBuildCost} />
          <SliderRow label="Revenue / Cabin / Year" value={revPerCabin} min={40_000} max={120_000} step={5_000} display={fmtEur(revPerCabin)} onChange={setRevPerCabin} />
          <SliderRow label="Contribution Margin" value={marginPct} min={50} max={90} step={5} display={`${marginPct}%`} onChange={setMarginPct} />

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
            <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block">Total Capex</span>
              <span className="text-lg font-semibold text-text-primary">{fmtEur(capex)}</span>
            </div>
            <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block">Annual Revenue</span>
              <span className="text-lg font-semibold text-text-primary">{fmtEur(annualRevenue)}</span>
            </div>
            <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block">Payback</span>
              <span className={`text-lg font-semibold ${paybackMonths <= 12 ? 'text-success' : 'text-alert'}`}>
                {Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—'}
              </span>
            </div>
            <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block">5-yr Net Contribution</span>
              <span className={`text-lg font-semibold ${fiveYearContribution >= 0 ? 'text-text-primary' : 'text-alert'}`}>{fmtEur(fiveYearContribution)}</span>
            </div>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Deck benchmark: {fmtEur(DECK.buildEur)} build, {fmtEur(DECK.revLowEur)}–{fmtEur(DECK.revHighEur)} revenue per cabin,
            payback under 12 months. At {fmtEur(revPerCabin)}/cabin, the €10M platform revenue target needs{' '}
            <span className="font-semibold text-text-primary">{cabinsForTarget} cabins</span> — whitespace alone offers{' '}
            {whitespace.length} candidate sites.
          </p>
        </div>

        {/* County whitespace ranking */}
        <div className="card p-5">
          <span className="eyebrow">Whitespace by County</span>
          <h2 className="text-base font-semibold mt-1 mb-4">Where the Gaps Are</h2>
          <div className="flex flex-col gap-2.5">
            {counties.slice(0, 9).map(([county, count]) => (
              <button key={county} onClick={() => setCountyFilter(county === countyFilter ? 'All' : county)} className="text-left group">
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`text-xs font-medium ${countyFilter === county ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'} transition`}>{county}</span>
                  <span className="text-xs text-text-muted">{count} sites</span>
                </div>
                <div className="h-1.5 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition ${countyFilter === county ? 'bg-[var(--accent-primary)]' : 'bg-[var(--accent-mid)]'}`}
                    style={{ width: `${(count / counties[0][1]) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target list */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect value={countyFilter} onChange={setCountyFilter} options={[{ value: 'All', label: 'All Counties' }, ...counties.map(([c]) => ({ value: c, label: c }))]} />
        <FilterSelect value={maxDist} onChange={setMaxDist} options={[
          { value: 'any', label: 'City Distance: Any' },
          { value: '15', label: '≤ 15 km' },
          { value: '30', label: '≤ 30 km' },
          { value: '60', label: '≤ 60 km' },
        ]} />
        <FilterChip active={swimOnly} onClick={() => setSwimOnly(v => !v)}>Swimming</FilterChip>
        <span className="text-xs text-text-muted ml-auto">{filtered.length} deployment candidates</span>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surface-alt text-[10px] uppercase tracking-widest text-text-muted">
            <span className="col-span-4">Partner Site</span>
            <span className="col-span-2">County</span>
            <span className="col-span-2">Water</span>
            <span className="col-span-1 text-right">City km</span>
            <span className="col-span-1 text-center">Swim</span>
            <span className="col-span-2 text-right">Stage</span>
          </div>
          <div className="divide-y divide-border max-h-[640px] overflow-y-auto">
            {filtered.slice(0, 150).map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="w-full grid grid-cols-12 gap-3 px-4 py-2.5 items-center text-left hover:bg-surface-alt/40 transition"
              >
                <div className="col-span-4 min-w-0">
                  <span className="text-sm font-medium truncate block">{t.name}</span>
                  {t.nearest_city && <span className="text-[10px] text-text-muted">near {t.nearest_city}</span>}
                </div>
                <span className="col-span-2 text-sm truncate">{t.county ?? '—'}</span>
                <span className="col-span-2 text-sm truncate">{t.water_name || t.water_type || '—'}</span>
                <span className="col-span-1 text-right text-sm">{t.city_dist_km !== null ? Math.round(t.city_dist_km) : '—'}</span>
                <span className="col-span-1 text-center text-sm">{t.has_swimming ? '✓' : ''}</span>
                <div className="col-span-2 flex justify-end"><StagePill stage={t.stage} /></div>
              </button>
            ))}
            {filtered.length > 150 && (
              <div className="px-4 py-3 text-center text-xs text-text-muted bg-surface-alt/40">
                Showing nearest 150 of {filtered.length} — tighten the filters for a working list.
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <TargetDetailModal
          target={{ kind: 'campsite', t: selected }}
          seedMode={seedMode}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
