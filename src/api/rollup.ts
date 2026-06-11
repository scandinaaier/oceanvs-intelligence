import { supabase } from '../lib/supabase'
import type {
  SaunaTarget, CampsiteTarget, CrmActivity, RollupStage, BrregFields,
} from '../types'

// ─────────────────────────────────────────────────────────────
// Roll-Up CRM data layer.
//
// LIVE API: Supabase tables `rollup_saunas`, `rollup_campsites`,
// `crm_activities` (migration 006). Until the migration is run,
// reads fall back to the bundled seed JSON in /public so the
// registry is browsable read-only — same graceful-degradation
// pattern as the live signals on City Overview.
// ─────────────────────────────────────────────────────────────

export type DataSource = 'supabase' | 'seed'

export interface SaunaResult { targets: SaunaTarget[]; source: DataSource }
export interface CampsiteResult { targets: CampsiteTarget[]; source: DataSource }

const EMPTY_CRM = {
  stage: 'prospect' as const,
  priority: 'medium' as const,
  assigned_to: null,
  last_contact_at: null,
  contact_source: null,
  estimated_valuation: null,
  crm_notes: null,
}

const EMPTY_BRREG: BrregFields = {
  org_number: null, legal_name: null, org_form: null, nace: null,
  employees: null, founded: null, municipality: null, ceo_name: null,
  board: [], owners_count: null, financials: [], revenue_nok: null,
  revenue_year: null, ebit_nok: null, yoy_growth_pct: null,
  brreg_match: 'none', brreg_synced_at: null,
}

// ── Seed mappers ──────────────────────────────────────────

function mapSaunaSeed(raw: any[], syncedAt: string | null): Omit<SaunaTarget, 'id'>[] {
  // locations_count: rows sharing one org number are sites of the same company
  const orgCounts: Record<string, number> = {}
  for (const op of raw) {
    const org = op.brreg?.org_number
    if (org) orgCounts[org] = (orgCounts[org] || 0) + 1
  }
  return raw.map(op => ({
    slug: op.id,
    name: op.name,
    region: op.region ?? null,
    sub_region: op.subRegion ?? null,
    operator_type: op.type ?? null,
    format: op.format ?? null,
    ownership_model: op.ownershipModel ?? null,
    water_access: op.waterAccess ?? null,
    price_range: op.priceRange ?? null,
    booking_model: op.bookingModel ?? null,
    year_est: op.yearEst ?? null,
    website: op.website || op.brreg?.registry_website || null,
    intel_notes: op.notes ?? null,
    is_multi_site: !!op.isMultiSite,
    locations_count: op.brreg?.org_number ? (orgCounts[op.brreg.org_number] || 1) : 1,
    cabins_count: null,
    ...EMPTY_BRREG,
    ...(op.brreg ? {
      org_number: op.brreg.org_number,
      legal_name: op.brreg.legal_name,
      org_form: op.brreg.org_form,
      nace: op.brreg.nace,
      employees: op.brreg.employees,
      founded: op.brreg.founded,
      municipality: op.brreg.municipality,
      ceo_name: op.brreg.ceo,
      board: op.brreg.board ?? [],
      owners_count: op.brreg.owners_count,
      financials: op.brreg.financials ?? [],
      revenue_nok: op.brreg.revenue_nok,
      revenue_year: op.brreg.revenue_year,
      ebit_nok: op.brreg.ebit_nok,
      yoy_growth_pct: op.brreg.yoy_growth_pct,
    } : {}),
    brreg_match: op.brreg_match ?? 'none',
    brreg_synced_at: op.brreg ? syncedAt : null,
    ...EMPTY_CRM,
    stage: op.stage ?? 'prospect',
    priority: op.priority ?? 'medium',
    contact_email: op.contact?.email || op.brreg?.registry_email || null,
    contact_name: op.contact?.ownerName || op.brreg?.ceo || null,
    contact_phone: op.contact?.phone ?? null,
    contact_source: op.contact?.contactSource ?? null,
    estimated_valuation: op.estimatedValuation ?? null,
    tags: op.tags ?? [],
  }))
}

function mapCampsiteSeed(raw: any[]): Omit<CampsiteTarget, 'id'>[] {
  return raw.map(c => ({
    source_id: c.source_id,
    name: c.name,
    country: c.country,
    county: c.county,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    water_type: c.water_type,
    water_name: c.water_name,
    nearest_city: c.nearest_city,
    city_dist_km: c.city_dist_km,
    is_waterfront: !!c.is_waterfront,
    has_beach: !!c.has_beach,
    has_swimming: !!c.has_swimming,
    has_sauna: !!c.has_sauna,
    facilities: c.facilities ?? [],
    website: c.website,
    plot_sqm: null,
    asking_price_nok: null,
    ...EMPTY_BRREG,
    ...EMPTY_CRM,
    contact_email: null,
    contact_name: null,
    contact_phone: null,
    tags: [],
  }))
}

async function fetchSeed(file: string): Promise<any[]> {
  const res = await fetch(`/${file}`)
  if (!res.ok) throw new Error(`Seed file ${file} missing`)
  return res.json()
}

// ── Saunas ────────────────────────────────────────────────

export async function fetchSaunaTargets(): Promise<SaunaResult> {
  const { data, error } = await supabase
    .from('rollup_saunas')
    .select('*')
    .order('revenue_nok', { ascending: false, nullsFirst: false })

  if (!error && data && data.length > 0) {
    return { targets: data as SaunaTarget[], source: 'supabase' }
  }
  if (!error && data && data.length === 0) {
    // table exists but is empty — registry page offers the import button
    return { targets: [], source: 'supabase' }
  }
  // table missing (migration not yet run) → bundled seed, read-only
  const raw = await fetchSeed('sauna_seed.json')
  const mapped = mapSaunaSeed(raw, null).map(t => ({ ...t, id: t.slug })) as SaunaTarget[]
  return { targets: mapped, source: 'seed' }
}

export async function importSaunaSeed(): Promise<number> {
  const raw = await fetchSeed('sauna_seed.json')
  const rows = mapSaunaSeed(raw, new Date().toISOString())
  const { error } = await supabase.from('rollup_saunas').upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
  return rows.length
}

export async function updateSaunaTarget(id: string, updates: Partial<SaunaTarget>): Promise<void> {
  const { error } = await supabase
    .from('rollup_saunas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Campsites ─────────────────────────────────────────────

export async function fetchCampsiteTargets(): Promise<CampsiteResult> {
  const { data, error } = await supabase
    .from('rollup_campsites')
    .select('*')
    .order('name')

  if (!error && data && data.length > 0) {
    return { targets: data as CampsiteTarget[], source: 'supabase' }
  }
  if (!error && data && data.length === 0) {
    return { targets: [], source: 'supabase' }
  }
  const raw = await fetchSeed('campsite_registry_seed.json')
  const mapped = mapCampsiteSeed(raw).map(t => ({ ...t, id: t.source_id })) as CampsiteTarget[]
  return { targets: mapped, source: 'seed' }
}

export async function importCampsiteSeed(onProgress?: (done: number, total: number) => void): Promise<number> {
  const raw = await fetchSeed('campsite_registry_seed.json')
  const rows = mapCampsiteSeed(raw)
  const CHUNK = 500
  let done = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await supabase.from('rollup_campsites').upsert(chunk, { onConflict: 'source_id', ignoreDuplicates: true })
    if (error) throw new Error(error.message)
    done += chunk.length
    onProgress?.(done, rows.length)
  }
  return rows.length
}

export async function updateCampsiteTarget(id: string, updates: Partial<CampsiteTarget>): Promise<void> {
  const { error } = await supabase
    .from('rollup_campsites')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Activities (who contacted whom, when, how) ────────────

export async function fetchActivities(targetType: 'sauna' | 'campsite', targetId: string): Promise<CrmActivity[]> {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('occurred_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as CrmActivity[]
}

export interface NewActivity {
  target_type: 'sauna' | 'campsite'
  target_id: string
  actor: string
  channel: CrmActivity['channel']
  summary: string
  stage_at_time?: string
}

/** Logs an activity and stamps last_contact_at on the target. */
export async function logActivity(a: NewActivity): Promise<void> {
  const { error } = await supabase.from('crm_activities').insert(a)
  if (error) throw new Error(error.message)
  if (a.channel !== 'note') {
    const table = a.target_type === 'sauna' ? 'rollup_saunas' : 'rollup_campsites'
    await supabase.from(table).update({ last_contact_at: new Date().toISOString() }).eq('id', a.target_id)
  }
}

export async function fetchRecentActivities(limit = 50): Promise<CrmActivity[]> {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as CrmActivity[]
}

// ── Shared helpers ────────────────────────────────────────

export function fmtNok(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `NOK ${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `NOK ${(n / 1_000).toFixed(0)}k`
  return `NOK ${n}`
}

export function nextStageOnOutreach(stage: RollupStage): RollupStage {
  return stage === 'prospect' ? 'outreach_sent' : stage
}
