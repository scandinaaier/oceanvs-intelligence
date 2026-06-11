// ─────────────────────────────────────────────────────────────
// Generates SQL import files for the rollup tables from the seed
// JSONs, written into /public so they can be fetched by the
// Supabase SQL editor session (vite dev serves them with CORS).
//
// Mirrors mapSaunaSeed / mapCampsiteSeed in src/api/rollup.ts.
// Usage: node scripts/build-import-sql.mjs
// ─────────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUB = path.join(__dirname, '..', 'public')
const NOW = new Date().toISOString()

const sauna = JSON.parse(fs.readFileSync(path.join(PUB, 'sauna_seed.json'), 'utf8'))
const camps = JSON.parse(fs.readFileSync(path.join(PUB, 'campsite_registry_seed.json'), 'utf8'))

// ── Saunas ────────────────────────────────────────────────
const orgCounts = {}
for (const op of sauna) {
  const org = op.brreg?.org_number
  if (org) orgCounts[org] = (orgCounts[org] || 0) + 1
}

const saunaRows = sauna.map(op => ({
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
  org_number: op.brreg?.org_number ?? null,
  legal_name: op.brreg?.legal_name ?? null,
  org_form: op.brreg?.org_form ?? null,
  nace: op.brreg?.nace ?? null,
  employees: op.brreg?.employees ?? null,
  founded: op.brreg?.founded ?? null,
  municipality: op.brreg?.municipality ?? null,
  ceo_name: op.brreg?.ceo ?? null,
  board: op.brreg?.board ?? [],
  owners_count: op.brreg?.owners_count ?? null,
  financials: op.brreg?.financials ?? [],
  revenue_nok: op.brreg?.revenue_nok ?? null,
  revenue_year: op.brreg?.revenue_year ?? null,
  ebit_nok: op.brreg?.ebit_nok ?? null,
  yoy_growth_pct: op.brreg?.yoy_growth_pct ?? null,
  brreg_match: op.brreg_match ?? 'none',
  brreg_synced_at: op.brreg ? NOW : null,
  stage: op.stage ?? 'prospect',
  priority: op.priority ?? 'medium',
  contact_email: op.contact?.email || op.brreg?.registry_email || null,
  contact_name: op.contact?.ownerName || op.brreg?.ceo || null,
  contact_phone: op.contact?.phone ?? null,
  contact_source: op.contact?.contactSource ?? null,
  estimated_valuation: op.estimatedValuation ?? null,
  tags: op.tags ?? [],
  crm_notes: null,
}))

const SAUNA_COLS = Object.keys(saunaRows[0])

function importSql(table, cols, rows, conflictCol) {
  const json = JSON.stringify(rows).replace(/'/g, "''")
  return `insert into public.${table} (${cols.join(', ')})
select ${cols.join(', ')}
from jsonb_populate_recordset(null::public.${table}, '${json}'::jsonb)
on conflict (${conflictCol}) do nothing;`
}

fs.writeFileSync(path.join(PUB, 'import_saunas.sql'), importSql('rollup_saunas', SAUNA_COLS, saunaRows, 'slug'))

// ── Campsites (chunked) ───────────────────────────────────
const campRows = camps.map(c => ({
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
}))
const CAMP_COLS = Object.keys(campRows[0])

const CHUNK = 900
let part = 0
for (let i = 0; i < campRows.length; i += CHUNK) {
  part++
  const sql = importSql('rollup_campsites', CAMP_COLS, campRows.slice(i, i + CHUNK), 'source_id')
  fs.writeFileSync(path.join(PUB, `import_campsites_${part}.sql`), sql)
}

console.log(`Wrote import_saunas.sql (${saunaRows.length} rows) + ${part} campsite parts (${campRows.length} rows total)`)
for (const f of fs.readdirSync(PUB).filter(f => f.startsWith('import_'))) {
  console.log(` ${f}: ${(fs.statSync(path.join(PUB, f)).size / 1024).toFixed(0)} KB`)
}
