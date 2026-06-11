// ─────────────────────────────────────────────────────────────
// Campsite registry seed — converts the campio.no Nordic dataset
// (scripts/campsites_nordics_full.csv) to public/campsite_registry_seed.json
//
// Usage: node scripts/build-campsite-seed.mjs
// ─────────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.join(__dirname, 'campsites_nordics_full.csv')
const OUT = path.join(__dirname, '..', 'public', 'campsite_registry_seed.json')

// Minimal CSV parser handling quoted fields with embedded commas
function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

const text = fs.readFileSync(SOURCE, 'utf8')
const [header, ...rows] = parseCsv(text)
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]))
const bool = v => String(v).toLowerCase() === 'true'

const seen = new Set()
const out = []
for (const r of rows) {
  if (r.length < header.length - 1) continue
  const id = r[col.id]
  if (!id || seen.has(id)) continue
  seen.add(id)
  const country = (r[col.country] || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) continue // skip malformed rows
  out.push({
    source_id: id,
    name: (r[col.name] || '').trim(),
    country,
    county: (r[col.county] || '').trim() || null,
    address: (r[col.address] || '').trim() || null,
    lat: parseFloat(r[col.lat]) || null,
    lng: parseFloat(r[col.lng]) || null,
    water_type: (r[col.water_type] || '').trim() || null,
    water_name: (r[col.water_name] || '').trim() || null,
    nearest_city: (r[col.nearest_city] || '').trim() || null,
    city_dist_km: parseFloat(r[col.city_dist_km]) || null,
    is_waterfront: bool(r[col.isWaterfront]),
    has_beach: bool(r[col.hasBeach]),
    has_swimming: bool(r[col.hasSwimming]),
    has_sauna: bool(r[col.hasSauna]),
    facilities: (r[col.facilities] || '').split('|').map(s => s.trim()).filter(Boolean),
    website: (r[col.website] || '').trim() || null,
  })
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(out))
const byCountry = out.reduce((m, c) => ((m[c.country] = (m[c.country] || 0) + 1), m), {})
console.log(`Wrote ${out.length} campsites → ${OUT}`)
console.log('By country:', JSON.stringify(byCountry))
console.log('Waterfront:', out.filter(c => c.is_waterfront).length, '| With sauna:', out.filter(c => c.has_sauna).length)
