import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSaunaTargets, importSaunaSeed, fmtNok } from '../../api/rollup'
import { Skeleton } from '../../components/common/Skeleton'
import { TargetDetailModal } from '../../components/rollup/TargetDetailModal'
import { StagePill, MatchBadge, SeedModeBanner, Stat, FilterChip, FilterSelect, fmtPct, growthClass } from '../../components/rollup/shared'
import type { SaunaTarget } from '../../types'

// Acquisition floor from the roll-up exercise: NOK 500k filed revenue.
const REVENUE_FLOOR = 500_000

const REVENUE_CHIPS = [
  { label: 'All Revenue', value: 0 },
  { label: '≥ 500k Floor', value: REVENUE_FLOOR },
  { label: '≥ 1M', value: 1_000_000 },
  { label: '≥ 5M', value: 5_000_000 },
  { label: '≥ 10M', value: 10_000_000 },
]

type SortKey = 'revenue' | 'growth' | 'rev_per_site' | 'name' | 'region'

export const SaunaRegistry: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [revenueFloor, setRevenueFloor] = useState(0)
  const [includeUnfiled, setIncludeUnfiled] = useState(true)
  const [growthMin, setGrowthMin] = useState('any')
  const [locationsMin, setLocationsMin] = useState('any')
  const [ownersFilter, setOwnersFilter] = useState('any')
  const [regionFilter, setRegionFilter] = useState('All')
  const [formatFilter, setFormatFilter] = useState('any')
  const [stageFilter, setStageFilter] = useState('All')
  const [multiSiteOnly, setMultiSiteOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')

  const q = useQuery({ queryKey: ['rollup', 'saunas'], queryFn: fetchSaunaTargets, staleTime: 30_000 })

  const importMut = useMutation({
    mutationFn: importSaunaSeed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rollup'] }),
  })

  const targets = q.data?.targets ?? []
  const seedMode = q.data?.source === 'seed'
  const selected = targets.find(t => t.id === selectedId)

  const regions = useMemo(() => ['All', ...Array.from(new Set(targets.map(t => t.region).filter(Boolean) as string[])).sort()], [targets])

  const filtered = useMemo(() => {
    let list = [...targets]
    if (revenueFloor > 0) {
      list = list.filter(t => (t.revenue_nok !== null && t.revenue_nok >= revenueFloor) || (includeUnfiled && t.revenue_nok === null))
    }
    if (growthMin !== 'any') {
      const min = Number(growthMin)
      list = list.filter(t => t.yoy_growth_pct !== null && t.yoy_growth_pct >= min)
    }
    if (locationsMin !== 'any') {
      const min = Number(locationsMin)
      list = list.filter(t => t.locations_count >= min)
    }
    if (ownersFilter !== 'any') {
      list = ownersFilter === 'simple'
        ? list.filter(t => t.owners_count !== null && t.owners_count <= 2)
        : list.filter(t => t.owners_count !== null && t.owners_count >= 3)
    }
    if (regionFilter !== 'All') list = list.filter(t => t.region === regionFilter)
    if (formatFilter !== 'any') {
      list = list.filter(t => (t.format ?? '').toLowerCase().includes(formatFilter))
    }
    if (stageFilter !== 'All') list = list.filter(t => t.stage === stageFilter)
    if (multiSiteOnly) list = list.filter(t => t.is_multi_site || t.locations_count > 1)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.legal_name?.toLowerCase().includes(s) ||
        t.sub_region?.toLowerCase().includes(s) ||
        t.intel_notes?.toLowerCase().includes(s) ||
        t.tags.some(tag => tag.toLowerCase().includes(s))
      )
    }
    const revPerSite = (t: SaunaTarget) => t.revenue_nok ? t.revenue_nok / Math.max(t.locations_count, 1) : -1
    list.sort((a, b) => {
      switch (sortKey) {
        case 'revenue': return (b.revenue_nok ?? -1) - (a.revenue_nok ?? -1)
        case 'growth': return (b.yoy_growth_pct ?? -999) - (a.yoy_growth_pct ?? -999)
        case 'rev_per_site': return revPerSite(b) - revPerSite(a)
        case 'region': return (a.region ?? '').localeCompare(b.region ?? '') || a.name.localeCompare(b.name)
        default: return a.name.localeCompare(b.name)
      }
    })
    return list
  }, [targets, revenueFloor, includeUnfiled, growthMin, locationsMin, ownersFilter, regionFilter, formatFilter, stageFilter, multiSiteOnly, search, sortKey])

  // Stats — company-level (dedupe rows that share an org number, e.g. Damp's 7
  // sites). Uncertain registry matches are excluded from the headline numbers
  // so a false match can never inflate the landscape revenue.
  const stats = useMemo(() => {
    const seenOrgs = new Set<string>()
    let qualified = 0, totalRevenue = 0, withFinancials = 0, needsVerify = 0
    for (const t of targets) {
      const key = t.org_number ?? t.id
      if (seenOrgs.has(key)) continue
      seenOrgs.add(key)
      if (t.revenue_nok === null) continue
      if (t.brreg_match === 'uncertain') { needsVerify++; continue }
      withFinancials++
      totalRevenue += t.revenue_nok
      if (t.revenue_nok >= REVENUE_FLOOR) qualified++
    }
    return { companies: seenOrgs.size, qualified, totalRevenue, withFinancials, needsVerify }
  }, [targets])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Norway Sauna Landscape</span>
          <h1 className="text-2xl font-semibold mt-1">Sauna Operator Registry</h1>
        </div>
        {!seedMode && targets.length === 0 && !q.isLoading && (
          <button onClick={() => importMut.mutate()} disabled={importMut.isPending} className="btn-primary">
            {importMut.isPending ? 'Importing…' : 'Import Operator Seed (69)'}
          </button>
        )}
      </div>

      {seedMode && <SeedModeBanner />}
      {importMut.isError && <div className="card px-4 py-3 text-xs text-alert">{(importMut.error as Error).message}</div>}

      {/* Stats */}
      <section className="grid grid-cols-4 gap-4">
        <Stat label="Operators Tracked" value={targets.length} sub={`${stats.companies} distinct companies`} />
        <Stat label="≥ NOK 500k Revenue" value={stats.qualified} accent sub="roll-up qualified companies" />
        <Stat label="With Filed Accounts" value={stats.withFinancials} sub={stats.needsVerify > 0 ? `+${stats.needsVerify} pending match review` : 'Brønnøysund registry data'} />
        <Stat label="Combined Revenue" value={fmtNok(stats.totalRevenue)} sub="latest filed year, verified matches" />
      </section>

      {/* Filters */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {REVENUE_CHIPS.map(c => (
            <FilterChip key={c.value} active={revenueFloor === c.value} onClick={() => setRevenueFloor(c.value)}>{c.label}</FilterChip>
          ))}
          {revenueFloor > 0 && (
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted cursor-pointer ml-1">
              <input type="checkbox" checked={includeUnfiled} onChange={e => setIncludeUnfiled(e.target.checked)} className="accent-[var(--accent-primary)]" />
              include unfiled
            </label>
          )}
          <div className="flex-1" />
          <input
            type="search"
            placeholder="Search operators…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect value={growthMin} onChange={setGrowthMin} options={[
            { value: 'any', label: 'YoY Growth: Any' },
            { value: '0', label: 'Growing (>0%)' },
            { value: '10', label: '> 10%' },
            { value: '25', label: '> 25%' },
            { value: '50', label: '> 50%' },
          ]} />
          <FilterSelect value={locationsMin} onChange={setLocationsMin} options={[
            { value: 'any', label: 'Locations: Any' },
            { value: '2', label: '2+ Sites' },
            { value: '3', label: '3+ Sites' },
            { value: '5', label: '5+ Sites' },
          ]} />
          <FilterSelect value={ownersFilter} onChange={setOwnersFilter} options={[
            { value: 'any', label: 'Ownership: Any' },
            { value: 'simple', label: '1–2 Board (simple)' },
            { value: 'complex', label: '3+ Board' },
          ]} />
          <FilterSelect value={regionFilter} onChange={setRegionFilter} options={regions.map(r => ({ value: r, label: r === 'All' ? 'All Regions' : r }))} />
          <FilterSelect value={formatFilter} onChange={setFormatFilter} options={[
            { value: 'any', label: 'Format: Any' },
            { value: 'floating', label: 'Floating' },
            { value: 'land', label: 'Land-Based' },
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
          <FilterChip active={multiSiteOnly} onClick={() => setMultiSiteOnly(v => !v)}>Multi-Site</FilterChip>
          <div className="flex-1" />
          <FilterSelect value={sortKey} onChange={v => setSortKey(v as SortKey)} options={[
            { value: 'revenue', label: 'Sort: Revenue' },
            { value: 'growth', label: 'Sort: YoY Growth' },
            { value: 'rev_per_site', label: 'Sort: Rev / Site' },
            { value: 'region', label: 'Sort: Region' },
            { value: 'name', label: 'Sort: Name' },
          ]} />
        </div>
      </div>

      <span className="text-xs text-text-muted">{filtered.length} operator{filtered.length !== 1 ? 's' : ''} in view</span>

      {/* Table */}
      {q.isLoading ? (
        <Skeleton className="h-96" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-text-muted">No operators match the current filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surface-alt text-[10px] uppercase tracking-widest text-text-muted">
            <span className="col-span-3">Operator</span>
            <span className="col-span-1">Sites</span>
            <span className="col-span-2 text-right">Revenue (NOK)</span>
            <span className="col-span-1 text-right">YoY</span>
            <span className="col-span-1 text-right">EBIT %</span>
            <span className="col-span-1 text-right">Rev / Site</span>
            <span className="col-span-1 text-center">Board</span>
            <span className="col-span-2 text-right">Stage</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(t => {
              const margin = t.revenue_nok && t.ebit_nok !== null ? (t.ebit_nok / t.revenue_nok) * 100 : null
              const revPerSite = t.revenue_nok ? t.revenue_nok / Math.max(t.locations_count, 1) : null
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="w-full grid grid-cols-12 gap-3 px-4 py-3 items-center text-left hover:bg-surface-alt/40 transition"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{t.name}</span>
                      {(t.is_multi_site || t.locations_count > 1) && (
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-secondary/15 text-accent-secondary shrink-0">Multi</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-text-muted truncate">{[t.region, t.sub_region].filter(Boolean).join(' · ')}</span>
                      <MatchBadge match={t.brreg_match} />
                    </div>
                  </div>
                  <span className="col-span-1 text-sm">{t.locations_count}</span>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-medium ${t.revenue_nok !== null && t.revenue_nok >= REVENUE_FLOOR ? 'text-text-primary' : 'text-text-muted'}`}>
                      {fmtNok(t.revenue_nok)}
                    </span>
                    {t.revenue_year && <span className="text-[9px] text-text-muted block">FY{t.revenue_year}</span>}
                  </div>
                  <span className={`col-span-1 text-right text-sm ${growthClass(t.yoy_growth_pct)}`}>{fmtPct(t.yoy_growth_pct)}</span>
                  <span className={`col-span-1 text-right text-sm ${margin === null ? 'text-text-muted' : margin >= 0 ? 'text-text-primary' : 'text-alert'}`}>
                    {margin !== null ? `${margin.toFixed(0)}%` : '—'}
                  </span>
                  <span className="col-span-1 text-right text-sm">{revPerSite ? fmtNok(revPerSite) : '—'}</span>
                  <span className="col-span-1 text-center text-sm">{t.owners_count ?? '—'}</span>
                  <div className="col-span-2 flex justify-end"><StagePill stage={t.stage} /></div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selected && (
        <TargetDetailModal
          target={{ kind: 'sauna', t: selected }}
          seedMode={seedMode}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
