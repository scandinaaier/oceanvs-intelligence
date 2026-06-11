import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampsiteTargets, importCampsiteSeed, fmtNok } from '../../api/rollup'
import { Skeleton } from '../../components/common/Skeleton'
import { TargetDetailModal } from '../../components/rollup/TargetDetailModal'
import { StagePill, SeedModeBanner, Stat, FilterChip, FilterSelect, fmtPct, growthClass } from '../../components/rollup/shared'
import type { CampsiteTarget } from '../../types'

const COUNTRY_LABELS: Record<string, string> = {
  NO: 'Norway', SE: 'Sweden', DK: 'Denmark', FI: 'Finland', IS: 'Iceland', AX: 'Åland',
}

type SortKey = 'name' | 'county' | 'city_dist' | 'revenue' | 'sqm_price'

export const CampsiteRegistry: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [country, setCountry] = useState('NO')
  const [countyFilter, setCountyFilter] = useState('All')
  const [waterfrontOnly, setWaterfrontOnly] = useState(true)
  const [hasSaunaOnly, setHasSaunaOnly] = useState(false)
  const [hasBeachOnly, setHasBeachOnly] = useState(false)
  const [maxCityDist, setMaxCityDist] = useState('any')
  const [revenueFilter, setRevenueFilter] = useState('any')
  const [stageFilter, setStageFilter] = useState('All')
  const [enrichedOnly, setEnrichedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null)

  const q = useQuery({ queryKey: ['rollup', 'campsites'], queryFn: fetchCampsiteTargets, staleTime: 30_000 })

  const importMut = useMutation({
    mutationFn: () => importCampsiteSeed((done, total) => setImportProgress({ done, total })),
    onSuccess: () => {
      setImportProgress(null)
      queryClient.invalidateQueries({ queryKey: ['rollup'] })
    },
  })

  const targets = q.data?.targets ?? []
  const seedMode = q.data?.source === 'seed'
  const selected = targets.find(t => t.id === selectedId)

  const counties = useMemo(() => {
    const set = new Set(targets.filter(t => t.country === country).map(t => t.county).filter(Boolean) as string[])
    return ['All', ...Array.from(set).sort()]
  }, [targets, country])

  const filtered = useMemo(() => {
    let list = targets.filter(t => country === 'ALL' || t.country === country)
    if (countyFilter !== 'All') list = list.filter(t => t.county === countyFilter)
    if (waterfrontOnly) list = list.filter(t => t.is_waterfront)
    if (hasSaunaOnly) list = list.filter(t => t.has_sauna)
    if (hasBeachOnly) list = list.filter(t => t.has_beach)
    if (maxCityDist !== 'any') list = list.filter(t => t.city_dist_km !== null && t.city_dist_km <= Number(maxCityDist))
    if (revenueFilter !== 'any') {
      list = revenueFilter === 'has'
        ? list.filter(t => t.revenue_nok !== null)
        : list.filter(t => t.revenue_nok !== null && t.revenue_nok >= Number(revenueFilter))
    }
    if (stageFilter !== 'All') list = list.filter(t => t.stage === stageFilter)
    if (enrichedOnly) list = list.filter(t => t.org_number !== null || t.plot_sqm !== null || t.asking_price_nok !== null)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.county?.toLowerCase().includes(s) ||
        t.nearest_city?.toLowerCase().includes(s) ||
        t.water_name?.toLowerCase().includes(s)
      )
    }
    const sqmPrice = (t: CampsiteTarget) => t.plot_sqm && t.asking_price_nok ? t.asking_price_nok / t.plot_sqm : Infinity
    list.sort((a, b) => {
      switch (sortKey) {
        case 'county': return (a.county ?? '').localeCompare(b.county ?? '') || a.name.localeCompare(b.name)
        case 'city_dist': return (a.city_dist_km ?? 9999) - (b.city_dist_km ?? 9999)
        case 'revenue': return (b.revenue_nok ?? -1) - (a.revenue_nok ?? -1)
        case 'sqm_price': return sqmPrice(a) - sqmPrice(b)
        default: return a.name.localeCompare(b.name)
      }
    })
    return list
  }, [targets, country, countyFilter, waterfrontOnly, hasSaunaOnly, hasBeachOnly, maxCityDist, revenueFilter, stageFilter, enrichedOnly, search, sortKey])

  // County waterfront NOK/m² benchmarks (for the "underpriced" comparison)
  const countyBenchmarks = useMemo(() => {
    const byCounty: Record<string, number[]> = {}
    for (const t of targets) {
      if (!t.is_waterfront || !t.county || !t.plot_sqm || !t.asking_price_nok) continue
      ;(byCounty[t.county] ??= []).push(t.asking_price_nok / t.plot_sqm)
    }
    const out: Record<string, { median: number; count: number }> = {}
    for (const [county, vals] of Object.entries(byCounty)) {
      vals.sort((a, b) => a - b)
      out[county] = { median: vals[Math.floor(vals.length / 2)], count: vals.length }
    }
    return out
  }, [targets])

  const stats = useMemo(() => {
    const inCountry = targets.filter(t => country === 'ALL' || t.country === country)
    return {
      total: inCountry.length,
      waterfront: inCountry.filter(t => t.is_waterfront).length,
      withSauna: inCountry.filter(t => t.has_sauna).length,
      inPipeline: inCountry.filter(t => t.stage !== 'prospect').length,
    }
  }, [targets, country])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Nordic Campsite Landscape</span>
          <h1 className="text-2xl font-semibold mt-1">Campsite Registry</h1>
        </div>
        {!seedMode && targets.length === 0 && !q.isLoading && (
          <button onClick={() => importMut.mutate()} disabled={importMut.isPending} className="btn-primary">
            {importMut.isPending
              ? importProgress ? `Importing… ${importProgress.done}/${importProgress.total}` : 'Importing…'
              : 'Import Nordic Dataset (4,362)'}
          </button>
        )}
      </div>

      {seedMode && <SeedModeBanner />}
      {importMut.isError && <div className="card px-4 py-3 text-xs text-alert">{(importMut.error as Error).message}</div>}

      {/* Stats */}
      <section className="grid grid-cols-4 gap-4">
        <Stat label={`Sites · ${country === 'ALL' ? 'Nordics' : COUNTRY_LABELS[country] ?? country}`} value={stats.total} />
        <Stat label="Waterfront" value={stats.waterfront} accent sub="confirmed water access" />
        <Stat label="With Sauna Today" value={stats.withSauna} sub="existing thermal infrastructure" />
        <Stat label="In Pipeline" value={stats.inPipeline} sub="moved beyond prospect" />
      </section>

      {/* Filters */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['NO', 'SE', 'DK', 'FI', 'IS', 'ALL'].map(c => (
            <FilterChip key={c} active={country === c} onClick={() => { setCountry(c); setCountyFilter('All') }}>
              {c === 'ALL' ? 'All Nordics' : COUNTRY_LABELS[c]}
            </FilterChip>
          ))}
          <div className="flex-1" />
          <input
            type="search"
            placeholder="Search campsites…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterChip active={waterfrontOnly} onClick={() => setWaterfrontOnly(v => !v)}>Waterfront</FilterChip>
          <FilterChip active={hasBeachOnly} onClick={() => setHasBeachOnly(v => !v)}>Beach</FilterChip>
          <FilterChip active={hasSaunaOnly} onClick={() => setHasSaunaOnly(v => !v)}>Has Sauna</FilterChip>
          <FilterChip active={enrichedOnly} onClick={() => setEnrichedOnly(v => !v)}>Enriched Only</FilterChip>
          <FilterSelect value={countyFilter} onChange={setCountyFilter} options={counties.map(c => ({ value: c, label: c === 'All' ? 'All Counties' : c }))} />
          <FilterSelect value={maxCityDist} onChange={setMaxCityDist} options={[
            { value: 'any', label: 'City Distance: Any' },
            { value: '15', label: '≤ 15 km' },
            { value: '30', label: '≤ 30 km' },
            { value: '60', label: '≤ 60 km' },
          ]} />
          <FilterSelect value={revenueFilter} onChange={setRevenueFilter} options={[
            { value: 'any', label: 'Revenue: Any' },
            { value: 'has', label: 'Has Filed Revenue' },
            { value: '5000000', label: '≥ 5M NOK' },
            { value: '10000000', label: '≥ 10M NOK' },
          ]} />
          <FilterSelect value={stageFilter} onChange={setStageFilter} options={[
            { value: 'All', label: 'All Stages' },
            { value: 'prospect', label: 'Prospect' },
            { value: 'outreach_sent', label: 'Outreach Sent' },
            { value: 'engaged', label: 'Engaged' },
            { value: 'meeting_booked', label: 'Meeting Booked' },
            { value: 'loi', label: 'Under LOI' },
            { value: 'acquired', label: 'Acquired' },
            { value: 'passed', label: 'Passed' },
          ]} />
          <div className="flex-1" />
          <FilterSelect value={sortKey} onChange={v => setSortKey(v as SortKey)} options={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'county', label: 'Sort: County' },
            { value: 'city_dist', label: 'Sort: City Proximity' },
            { value: 'revenue', label: 'Sort: Revenue' },
            { value: 'sqm_price', label: 'Sort: NOK/m² (cheapest)' },
          ]} />
        </div>
      </div>

      <span className="text-xs text-text-muted">{filtered.length.toLocaleString()} site{filtered.length !== 1 ? 's' : ''} in view</span>

      {/* Table */}
      {q.isLoading ? (
        <Skeleton className="h-96" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-text-muted">No campsites match the current filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surface-alt text-[10px] uppercase tracking-widest text-text-muted">
            <span className="col-span-3">Campsite</span>
            <span className="col-span-2">County / Water</span>
            <span className="col-span-1 text-right">City km</span>
            <span className="col-span-2 text-right">Revenue (NOK)</span>
            <span className="col-span-1 text-right">YoY</span>
            <span className="col-span-1 text-right">NOK/m²</span>
            <span className="col-span-2 text-right">Stage</span>
          </div>
          <div className="divide-y divide-border max-h-[920px] overflow-y-auto">
            {filtered.slice(0, 300).map(t => {
              const sqmPrice = t.plot_sqm && t.asking_price_nok ? t.asking_price_nok / t.plot_sqm : null
              const bench = t.county ? countyBenchmarks[t.county] : undefined
              const underpriced = sqmPrice !== null && bench && bench.count >= 3 && sqmPrice < bench.median
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="w-full grid grid-cols-12 gap-3 px-4 py-2.5 items-center text-left hover:bg-surface-alt/40 transition"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{t.name}</span>
                      {t.is_waterfront && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-secondary/15 text-accent-secondary shrink-0">Waterfront</span>}
                      {underpriced && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-success/15 text-success shrink-0">Underpriced</span>}
                    </div>
                    <span className="text-[10px] text-text-muted block mt-0.5 truncate">
                      {[t.has_sauna && 'Sauna', t.has_beach && 'Beach', t.has_swimming && 'Swimming'].filter(Boolean).join(' · ') || 'Basic site'}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <span className="text-sm truncate block">{t.county ?? '—'}</span>
                    <span className="text-[10px] text-text-muted truncate block">{t.water_name || t.water_type || ''}</span>
                  </div>
                  <span className="col-span-1 text-right text-sm">{t.city_dist_km !== null ? Math.round(t.city_dist_km) : '—'}</span>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-medium ${t.revenue_nok ? 'text-text-primary' : 'text-text-muted'}`}>{fmtNok(t.revenue_nok)}</span>
                    {t.revenue_year && <span className="text-[9px] text-text-muted block">FY{t.revenue_year}</span>}
                  </div>
                  <span className={`col-span-1 text-right text-sm ${growthClass(t.yoy_growth_pct)}`}>{fmtPct(t.yoy_growth_pct)}</span>
                  <span className="col-span-1 text-right text-sm">{sqmPrice !== null ? sqmPrice.toFixed(0) : '—'}</span>
                  <div className="col-span-2 flex justify-end"><StagePill stage={t.stage} /></div>
                </button>
              )
            })}
            {filtered.length > 300 && (
              <div className="px-4 py-3 text-center text-xs text-text-muted bg-surface-alt/40">
                Showing first 300 of {filtered.length.toLocaleString()} — narrow the filters to see specific targets.
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <TargetDetailModal
          target={{ kind: 'campsite', t: selected }}
          seedMode={seedMode}
          countyBenchmark={selected.county ? countyBenchmarks[selected.county] ?? null : null}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
