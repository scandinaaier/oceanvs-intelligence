import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaunaTarget, CampsiteTarget, RollupStage, RollupPriority, YearFinancials } from '../../types'
import { updateSaunaTarget, updateCampsiteTarget, fmtNok } from '../../api/rollup'
import { searchBrreg, enrichFromBrreg, BrregSearchHit } from '../../api/brreg'
import { StageSelector, MatchBadge, PriorityDot, fmtPct, growthClass } from './shared'
import { ActivityLogPanel } from './ActivityLogPanel'
import { EmailComposerModal, ComposerTarget } from './EmailComposerModal'

type AnyTarget =
  | { kind: 'sauna'; t: SaunaTarget }
  | { kind: 'campsite'; t: CampsiteTarget }

// Deck benchmarks (Sauna Club unit economics, June 2026)
const CABIN_BUILD_EUR = 45_000
const CABIN_REV_LOW_EUR = 60_000
const CABIN_REV_HIGH_EUR = 100_000
const EUR_NOK = 11.6

/** Merge two financial-year lists (newer source wins per year) and derive
 *  the denormalised latest-year fields + YoY growth. */
function deriveFinancialUpdates(existing: YearFinancials[], incoming: YearFinancials[]) {
  const byYear = new Map<number, YearFinancials>()
  for (const f of existing) byYear.set(f.year, f)
  for (const f of incoming) byYear.set(f.year, f)
  const merged = [...byYear.values()].sort((a, b) => b.year - a.year)
  const latest = merged[0] ?? null
  const prev = merged.find(f => latest && f.year === latest.year - 1) ?? null
  const yoy = latest?.revenue_nok && prev?.revenue_nok
    ? Math.round(((latest.revenue_nok - prev.revenue_nok) / prev.revenue_nok) * 1000) / 10
    : null
  return {
    financials: merged,
    revenue_nok: latest?.revenue_nok ?? null,
    revenue_year: latest?.year ?? null,
    ebit_nok: latest?.ebit_nok ?? null,
    yoy_growth_pct: yoy,
  }
}

const Fact: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
    <span className="text-[9px] uppercase tracking-widest text-text-muted block">{label}</span>
    <span className="text-xs font-medium text-text-primary mt-0.5 block">{value || '—'}</span>
  </div>
)

const FinancialsTable: React.FC<{ target: SaunaTarget | CampsiteTarget }> = ({ target }) => {
  if (!target.financials || target.financials.length === 0) {
    return <p className="text-xs text-text-muted italic">No filed accounts available{target.org_number ? '' : ' — link a registry entity first'}.</p>
  }
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-surface-alt text-[9px] uppercase tracking-widest text-text-muted">
        <span>Year</span>
        <span className="text-right">Revenue</span>
        <span className="text-right">EBIT</span>
        <span className="text-right">Margin</span>
        <span className="text-right">Result</span>
        <span className="text-right">Equity</span>
      </div>
      <div className="divide-y divide-border">
        {target.financials.map(f => {
          const margin = f.revenue_nok && f.ebit_nok !== null ? (f.ebit_nok / f.revenue_nok) * 100 : null
          return (
            <div key={f.year} className="grid grid-cols-6 gap-2 px-3 py-2 text-xs items-center">
              <span className="font-semibold text-accent-primary">{f.year}</span>
              <span className="text-right font-medium">{fmtNok(f.revenue_nok)}</span>
              <span className="text-right">{fmtNok(f.ebit_nok)}</span>
              <span className={`text-right ${margin !== null && margin >= 0 ? 'text-success' : 'text-alert'}`}>{margin !== null ? `${margin.toFixed(1)}%` : '—'}</span>
              <span className="text-right">{fmtNok(f.result_nok)}</span>
              <span className="text-right">{fmtNok(f.equity_nok)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RegistryLinker: React.FC<{ name: string; onPick: (hit: BrregSearchHit) => void; busy: boolean }> = ({ name, onPick, busy }) => {
  const [query, setQuery] = useState(name)
  const [hits, setHits] = useState<BrregSearchHit[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setSearching(true); setError(null)
    try { setHits(await searchBrreg(query)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Search failed') }
    finally { setSearching(false) }
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          className="flex-1 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          placeholder="Search Brønnøysund by company name…"
        />
        <button onClick={run} disabled={searching} className="btn-secondary">{searching ? 'Searching…' : 'Search'}</button>
      </div>
      {error && <p className="text-xs text-alert mt-2">{error} — is the Netlify function available? (Use `netlify dev` locally.)</p>}
      {hits && hits.length === 0 && <p className="text-xs text-text-muted mt-2 italic">No registry entities found.</p>}
      {hits && hits.length > 0 && (
        <div className="mt-2 divide-y divide-border border border-[var(--border)] rounded-lg overflow-hidden">
          {hits.slice(0, 6).map(h => (
            <button
              key={h.org_number}
              disabled={busy}
              onClick={() => onPick(h)}
              className="w-full text-left px-3 py-2 hover:bg-[var(--surface-alt)] transition flex items-center justify-between gap-2"
            >
              <span className="text-xs font-medium text-text-primary">{h.legal_name}</span>
              <span className="text-[10px] text-text-muted whitespace-nowrap">{h.org_form} · {h.org_number}{h.municipality ? ` · ${h.municipality}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const TargetDetailModal: React.FC<{
  target: AnyTarget
  seedMode: boolean
  countyBenchmark?: { median: number; count: number } | null
  onClose: () => void
}> = ({ target, seedMode, countyBenchmark, onClose }) => {
  const { kind, t } = target
  const queryClient = useQueryClient()
  const [showComposer, setShowComposer] = useState(false)
  const [showLinker, setShowLinker] = useState(false)
  const [contactEmail, setContactEmail] = useState(t.contact_email ?? '')
  const [contactName, setContactName] = useState(t.contact_name ?? '')
  const [contactPhone, setContactPhone] = useState(t.contact_phone ?? '')
  const [assignedTo, setAssignedTo] = useState(t.assigned_to ?? '')
  const [crmNotes, setCrmNotes] = useState(t.crm_notes ?? '')
  const [plotSqm, setPlotSqm] = useState(kind === 'campsite' ? ((t as CampsiteTarget).plot_sqm ?? '') : '')
  const [askingPrice, setAskingPrice] = useState(kind === 'campsite' ? ((t as CampsiteTarget).asking_price_nok ?? '') : '')

  const update = kind === 'sauna' ? updateSaunaTarget : updateCampsiteTarget

  const saveMut = useMutation({
    mutationFn: (updates: Record<string, unknown>) => update(t.id, updates as never),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rollup'] }),
  })

  const enrichMut = useMutation({
    mutationFn: async (orgnr: string) => {
      const data = await enrichFromBrreg(orgnr)
      const { registry_email, registry_website, ...brregFields } = data
      // switching to a different entity discards old financials; refreshing the
      // same entity merges, so manually entered prior years survive
      const base = orgnr === t.org_number ? t.financials : []
      await update(t.id, {
        ...brregFields,
        ...deriveFinancialUpdates(base, data.financials),
        brreg_match: 'confirmed',
        brreg_synced_at: new Date().toISOString(),
        ...(registry_email && !t.contact_email ? { contact_email: registry_email } : {}),
        ...(data.ceo_name && !t.contact_name ? { contact_name: data.ceo_name } : {}),
      } as never)
    },
    onSuccess: () => {
      setShowLinker(false)
      queryClient.invalidateQueries({ queryKey: ['rollup'] })
    },
  })

  const [manualYear, setManualYear] = useState('')
  const [manualRevenue, setManualRevenue] = useState('')
  const [manualEbit, setManualEbit] = useState('')

  const addManualYear = () => {
    const entry: YearFinancials = {
      year: Number(manualYear),
      revenue_nok: Number(manualRevenue),
      ebit_nok: Number(manualEbit) || null,
      result_nok: null,
      equity_nok: null,
      debt_nok: null,
    }
    saveMut.mutate(deriveFinancialUpdates(t.financials, [entry]))
    setManualYear(''); setManualRevenue(''); setManualEbit('')
  }

  const setStage = (stage: RollupStage) => saveMut.mutate({ stage })
  const setPriority = (priority: RollupPriority) => saveMut.mutate({ priority })
  const saveContact = () => saveMut.mutate({
    contact_email: contactEmail || null,
    contact_name: contactName || null,
    contact_phone: contactPhone || null,
    assigned_to: assignedTo || null,
  })

  const sauna = kind === 'sauna' ? (t as SaunaTarget) : null
  const camp = kind === 'campsite' ? (t as CampsiteTarget) : null

  // Sauna unit economics vs deck benchmark
  const revPerLocation = sauna?.revenue_nok && sauna.locations_count
    ? sauna.revenue_nok / sauna.locations_count : null
  const revPerLocationEur = revPerLocation ? revPerLocation / EUR_NOK : null

  // Campsite land economics
  const sqm = camp ? Number(plotSqm) || camp.plot_sqm : null
  const price = camp ? Number(askingPrice) || camp.asking_price_nok : null
  const nokPerSqm = sqm && price ? price / sqm : null

  const composerTarget: ComposerTarget = {
    targetType: kind,
    targetId: t.id,
    name: t.name,
    contactEmail: contactEmail || t.contact_email,
    contactName: contactName || t.contact_name,
    location: sauna ? (sauna.sub_region ?? sauna.region) : (camp?.nearest_city ?? camp?.county ?? null),
    waterBody: sauna ? (sauna.water_access?.replace(/^Yes\s*[—-]\s*/, '') ?? null) : (camp?.water_name || camp?.water_type || null),
    formatDesc: sauna?.format ?? 'campsite',
    yearEst: sauna?.year_est ?? null,
    notableDetail: sauna?.intel_notes ?? (camp?.is_waterfront ? 'a waterfront site with real potential' : null),
    stage: t.stage,
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto pt-8 pb-8" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[860px] border border-[var(--border)] my-auto" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="eyebrow">{kind === 'sauna' ? 'Sauna Operator' : 'Campsite'}</span>
                  <MatchBadge match={t.brreg_match} />
                  <PriorityDot priority={t.priority} />
                </div>
                <h2 className="text-xl font-semibold mt-1">{t.name}</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  {sauna ? [sauna.region, sauna.sub_region].filter(Boolean).join(' · ') : [camp?.county, camp?.country, camp?.nearest_city ? `${Math.round(camp.city_dist_km ?? 0)}km from ${camp.nearest_city}` : null].filter(Boolean).join(' · ')}
                  {t.legal_name && t.legal_name.toLowerCase() !== t.name.toLowerCase() && <span> · {t.legal_name}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={t.priority}
                  disabled={seedMode}
                  onChange={e => setPriority(e.target.value as RollupPriority)}
                  className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--surface-alt)] text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
              </div>
            </div>
            <div className="mt-4">
              <StageSelector stage={t.stage} onChange={setStage} disabled={seedMode} />
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">

            {/* Registry / financials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">Brønnøysund Registry &amp; Filed Accounts</span>
                <div className="flex gap-2">
                  {t.org_number && !seedMode && (
                    <button
                      onClick={() => enrichMut.mutate(t.org_number!)}
                      disabled={enrichMut.isPending}
                      className="btn-secondary text-xs"
                    >
                      {enrichMut.isPending ? 'Refreshing…' : 'Refresh from Brreg'}
                    </button>
                  )}
                  {!seedMode && (
                    <button onClick={() => setShowLinker(v => !v)} className="btn-secondary text-xs">
                      {t.org_number ? 'Re-link entity' : 'Link registry entity'}
                    </button>
                  )}
                </div>
              </div>
              {enrichMut.isError && <p className="text-xs text-alert mb-2">{(enrichMut.error as Error).message}</p>}
              {showLinker && <RegistryLinker name={t.name} onPick={h => enrichMut.mutate(h.org_number)} busy={enrichMut.isPending} />}

              {t.org_number && (
                <div className="grid grid-cols-4 gap-2 mt-2 mb-3">
                  <Fact label="Org Number" value={
                    <a href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${t.org_number}`} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
                      {t.org_number} ↗
                    </a>
                  } />
                  <Fact label="Employees" value={t.employees ?? '—'} />
                  <Fact label="CEO" value={t.ceo_name ?? '—'} />
                  <Fact label="Board (owners proxy)" value={t.owners_count ? `${t.owners_count} member${t.owners_count > 1 ? 's' : ''}` : '—'} />
                </div>
              )}

              <FinancialsTable target={t} />

              {t.yoy_growth_pct !== null && (
                <p className="text-xs mt-2">
                  <span className="text-text-muted">YoY revenue growth · </span>
                  <span className={`font-semibold ${growthClass(t.yoy_growth_pct)}`}>{fmtPct(t.yoy_growth_pct)}</span>
                </p>
              )}

              {/* Manual prior-year entry — the open registry API only serves the
                  latest filed year, so growth history is added from Proff.no */}
              {!seedMode && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[9px] uppercase tracking-widest text-text-muted shrink-0">Add year (Proff.no)</span>
                  <input
                    value={manualYear}
                    onChange={e => setManualYear(e.target.value)}
                    placeholder="Year"
                    className="w-16 border border-[var(--border)] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  />
                  <input
                    value={manualRevenue}
                    onChange={e => setManualRevenue(e.target.value)}
                    placeholder="Revenue (NOK)"
                    className="w-32 border border-[var(--border)] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  />
                  <input
                    value={manualEbit}
                    onChange={e => setManualEbit(e.target.value)}
                    placeholder="EBIT (optional)"
                    className="w-28 border border-[var(--border)] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  />
                  <button
                    onClick={addManualYear}
                    disabled={!/^\d{4}$/.test(manualYear) || !Number(manualRevenue)}
                    className="btn-secondary text-xs disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Unit economics */}
            {sauna && (
              <div>
                <span className="eyebrow block mb-2">Unit Economics vs Deck Benchmark</span>
                <div className="grid grid-cols-3 gap-2">
                  <Fact label="Sites (registry rows)" value={sauna.locations_count} />
                  <Fact label="Revenue / Site" value={revPerLocation ? `${fmtNok(revPerLocation)} (€${Math.round((revPerLocationEur ?? 0) / 1000)}k)` : '—'} />
                  <Fact label="Deck Benchmark" value={`€${CABIN_BUILD_EUR / 1000}k build · €${CABIN_REV_LOW_EUR / 1000}–${CABIN_REV_HIGH_EUR / 1000}k rev/yr`} />
                </div>
                {revPerLocationEur !== null && (
                  <p className="text-xs text-text-muted mt-2">
                    {revPerLocationEur >= CABIN_REV_LOW_EUR
                      ? `Generating ${(revPerLocationEur / CABIN_REV_LOW_EUR).toFixed(1)}x the deck's €60k/cabin baseline — strong roll-up candidate.`
                      : `At ${Math.round((revPerLocationEur / CABIN_REV_LOW_EUR) * 100)}% of the €60k/cabin baseline — upside case rests on utilization gains.`}
                  </p>
                )}
              </div>
            )}

            {camp && (
              <div>
                <span className="eyebrow block mb-2">Land Economics</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
                    <span className="text-[9px] uppercase tracking-widest text-text-muted block">Plot Size (m²)</span>
                    <input
                      value={plotSqm}
                      disabled={seedMode}
                      onChange={e => setPlotSqm(e.target.value)}
                      onBlur={() => saveMut.mutate({ plot_sqm: Number(plotSqm) || null })}
                      placeholder="e.g. 25000"
                      className="w-full bg-transparent text-xs font-medium text-text-primary mt-0.5 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
                    <span className="text-[9px] uppercase tracking-widest text-text-muted block">Asking / Est. Value (NOK)</span>
                    <input
                      value={askingPrice}
                      disabled={seedMode}
                      onChange={e => setAskingPrice(e.target.value)}
                      onBlur={() => saveMut.mutate({ asking_price_nok: Number(askingPrice) || null })}
                      placeholder="e.g. 12000000"
                      className="w-full bg-transparent text-xs font-medium text-text-primary mt-0.5 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <Fact label="NOK / m²" value={nokPerSqm ? nokPerSqm.toFixed(0) : '—'} />
                </div>
                {nokPerSqm && countyBenchmark && countyBenchmark.count >= 3 && (
                  <p className="text-xs mt-2">
                    <span className="text-text-muted">vs {camp.county ?? 'county'} waterfront median ({countyBenchmark.median.toFixed(0)} NOK/m², n={countyBenchmark.count}) · </span>
                    <span className={`font-semibold ${nokPerSqm < countyBenchmark.median ? 'text-success' : 'text-alert'}`}>
                      {nokPerSqm < countyBenchmark.median
                        ? `${Math.round((1 - nokPerSqm / countyBenchmark.median) * 100)}% below median — potentially underpriced`
                        : `${Math.round((nokPerSqm / countyBenchmark.median - 1) * 100)}% above median`}
                    </span>
                  </p>
                )}
                {camp.revenue_nok && price ? (
                  <p className="text-xs mt-1">
                    <span className="text-text-muted">Price / Revenue · </span>
                    <span className="font-semibold text-text-primary">{(price / camp.revenue_nok).toFixed(1)}x</span>
                  </p>
                ) : null}
              </div>
            )}

            {/* Qualitative facts */}
            <div>
              <span className="eyebrow block mb-2">Profile</span>
              <div className="grid grid-cols-3 gap-2">
                {sauna && <>
                  <Fact label="Format" value={sauna.format} />
                  <Fact label="Ownership" value={sauna.ownership_model} />
                  <Fact label="Water Access" value={sauna.water_access} />
                  <Fact label="Price Range" value={sauna.price_range} />
                  <Fact label="Booking Model" value={sauna.booking_model} />
                  <Fact label="Established" value={sauna.year_est} />
                </>}
                {camp && <>
                  <Fact label="Water" value={[camp.water_type, camp.water_name].filter(Boolean).join(' · ')} />
                  <Fact label="Waterfront" value={camp.is_waterfront ? 'Yes' : 'No'} />
                  <Fact label="Beach / Swim / Sauna" value={[camp.has_beach && 'Beach', camp.has_swimming && 'Swim', camp.has_sauna && 'Sauna'].filter(Boolean).join(' · ') || 'None'} />
                  <Fact label="Nearest City" value={camp.nearest_city ? `${camp.nearest_city} (${Math.round(camp.city_dist_km ?? 0)}km)` : '—'} />
                  <Fact label="Facilities" value={`${camp.facilities.length} listed`} />
                  <Fact label="Coordinates" value={camp.lat ? (
                    <a href={`https://www.google.com/maps?q=${camp.lat},${camp.lng}`} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Map ↗</a>
                  ) : '—'} />
                </>}
              </div>
              {camp && camp.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {camp.facilities.map(f => (
                    <span key={f} className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--surface-alt)] text-text-muted">{f.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              )}
              {sauna?.intel_notes && (
                <div className="mt-2 bg-[var(--surface-alt)] border-l-4 border-l-[var(--accent-secondary)] rounded-lg px-3 py-2">
                  <span className="text-[9px] uppercase tracking-widest text-text-muted block mb-0.5">Intel Note</span>
                  <p className="text-xs text-text-primary">{sauna.intel_notes}</p>
                </div>
              )}
              {t.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact */}
            <div>
              <span className="eyebrow block mb-2">Contact &amp; Ownership</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Email', value: contactEmail, set: setContactEmail, ph: 'owner@operator.no' },
                  { label: 'Name', value: contactName, set: setContactName, ph: 'Owner / CEO' },
                  { label: 'Phone', value: contactPhone, set: setContactPhone, ph: '+47 …' },
                  { label: 'Assigned To', value: assignedTo, set: setAssignedTo, ph: 'team member email' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[9px] uppercase tracking-widest text-text-muted block mb-1">{f.label}</label>
                    <input
                      value={f.value}
                      disabled={seedMode}
                      onChange={e => f.set(e.target.value)}
                      onBlur={saveContact}
                      placeholder={f.ph}
                      className="w-full border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 disabled:opacity-60 disabled:bg-[var(--surface-alt)]"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                {t.website && (
                  <a href={t.website.startsWith('http') ? t.website : `https://${t.website}`} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
                    {t.website} ↗
                  </a>
                )}
                {t.last_contact_at && <span>Last contact: {new Date(t.last_contact_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                {t.estimated_valuation && <span>Est. valuation: <span className="text-text-primary font-medium">{t.estimated_valuation}</span></span>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <span className="eyebrow block mb-2">Deal Notes</span>
              <textarea
                rows={2}
                value={crmNotes}
                disabled={seedMode}
                onChange={e => setCrmNotes(e.target.value)}
                onBlur={() => saveMut.mutate({ crm_notes: crmNotes || null })}
                placeholder="Thesis fit, structure ideas, next steps…"
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 disabled:opacity-60 disabled:bg-[var(--surface-alt)]"
              />
            </div>

            {/* Activity log */}
            <ActivityLogPanel targetType={kind} targetId={t.id} currentStage={t.stage} disabled={seedMode} />

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-[10px] text-text-muted">
                {t.brreg_synced_at ? `Registry synced ${new Date(t.brreg_synced_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Registry not yet synced'}
              </span>
              <button onClick={() => setShowComposer(true)} className="btn-primary">Compose Outreach Email</button>
            </div>
          </div>
        </div>
      </div>

      {showComposer && (
        <EmailComposerModal
          target={composerTarget}
          disabled={seedMode}
          onClose={() => setShowComposer(false)}
          onStageAdvance={setStage}
        />
      )}
    </>
  )
}
