// One-off admin utility: backfill price_nok for Finn.no rows that were saved
// while the price-extraction bug was live (price_nok = 0).
//
// Re-runs the (now fixed) fetch-url-meta extractor against each listing's live
// Finn.no page and updates price_nok where a real price is found.
//
// Access: campsite_pipeline RLS only allows the `authenticated`/`service_role`
// roles, so the anon key alone cannot read/write. Provide ONE of:
//   • SUPABASE_SERVICE_ROLE_KEY   (preferred — bypasses RLS, no login needed)
//   • SUPABASE_EMAIL + SUPABASE_PASSWORD  (a team member's login)
//
// Usage (PowerShell):
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."; node scripts/backfill-finn-prices.mjs --dry-run
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."; node scripts/backfill-finn-prices.mjs
//
// --dry-run prints what WOULD change without writing.

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { handler } from '../netlify/functions/fetch-url-meta.js'

const DRY = process.argv.includes('--dry-run')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ── Read Supabase URL from .env.local ─────────────────────
function envFromFile(name) {
  const line = readFileSync(join(root, '.env.local'), 'utf8')
    .split(/\r?\n/).find(l => l.startsWith(name + '='))
  return line ? line.slice(name.length + 1).replace(/^["']|["']$/g, '').trim() : ''
}
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envFromFile('VITE_SUPABASE_URL')
const ANON_KEY     = process.env.VITE_SUPABASE_ANON_KEY || envFromFile('VITE_SUPABASE_ANON_KEY')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EMAIL        = process.env.SUPABASE_EMAIL || ''
const PASSWORD     = process.env.SUPABASE_PASSWORD || ''

if (!SUPABASE_URL) { console.error('Missing VITE_SUPABASE_URL'); process.exit(1) }

// ── Resolve an access token + apikey for authorized REST calls ──
async function authHeaders() {
  if (SERVICE_KEY) {
    return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  }
  if (EMAIL && PASSWORD) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    if (!res.ok) { console.error('Login failed:', await res.text()); process.exit(1) }
    const { access_token } = await res.json()
    return { apikey: ANON_KEY, Authorization: `Bearer ${access_token}` }
  }
  console.error('No credentials. Set SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_EMAIL + SUPABASE_PASSWORD.')
  process.exit(1)
}

// ── Re-extract price for one row via the fixed handler ────
async function priceFor(url) {
  try {
    const res = await handler({ httpMethod: 'GET', queryStringParameters: { url } })
    const body = JSON.parse(res.body)
    return Number.isFinite(body.priceNok) ? body.priceNok : 0
  } catch { return 0 }
}

async function main() {
  const headers = await authHeaders()
  console.log(`Mode: ${DRY ? 'DRY-RUN (no writes)' : 'LIVE'}  •  ${SERVICE_KEY ? 'service_role' : 'user login'}\n`)

  // Finn.no rows currently missing a price
  const q = `${SUPABASE_URL}/rest/v1/campsite_pipeline` +
            `?select=id,finnkode,url,title,price_nok&price_nok=eq.0&url=not.is.null`
  const rows = await fetch(q, { headers }).then(r => r.json())
  if (!Array.isArray(rows)) { console.error('Read failed:', rows); process.exit(1) }

  const finnRows = rows.filter(r => (r.url || '').includes('finn.no'))
  console.log(`Found ${finnRows.length} Finn.no row(s) with price_nok = 0.\n`)

  let updated = 0, stillZero = 0
  for (const r of finnRows) {
    const price = await priceFor(r.url)
    const label = (r.title || r.finnkode || r.id).slice(0, 48).padEnd(48)
    if (price > 0) {
      if (!DRY) {
        const patch = await fetch(`${SUPABASE_URL}/rest/v1/campsite_pipeline?id=eq.${r.id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ price_nok: price, scraped_at: new Date().toISOString() }),
        })
        if (!patch.ok) { console.log(`ERR   ${label} ${await patch.text()}`); continue }
      }
      console.log(`${DRY ? 'WOULD' : 'SET  '} ${label} → ${price.toLocaleString('no-NO')} NOK`)
      updated++
    } else {
      console.log(`SKIP  ${label} (no price found — likely genuine POA)`)
      stillZero++
    }
  }
  console.log(`\nDone. ${DRY ? 'Would update' : 'Updated'} ${updated}, left ${stillZero} as POA.`)
}

main()
