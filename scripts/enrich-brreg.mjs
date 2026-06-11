// ─────────────────────────────────────────────────────────────
// Brønnøysund enrichment — builds public/sauna_seed.json
//
// Reads the 69-operator research file (scripts/saunaOperators_source.ts),
// matches each operator against Enhetsregisteret, then pulls:
//   - entity facts (org form, employees, founded, municipality, email)
//   - roles (CEO + board → owners proxy)
//   - annual accounts for up to 3 years (revenue, EBIT, result, equity, debt)
//
// Match confidence:
//   confirmed — org number was already in the research file
//   high      — single strong name match in a leisure/wellness NACE code
//   uncertain — name match found but ambiguous; review before trusting
//   none      — no plausible registry match (sole props, non-profits, etc.)
//
// Usage: node scripts/enrich-brreg.mjs
// ─────────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.join(__dirname, 'saunaOperators_source.ts')
const OUT = path.join(__dirname, '..', 'public', 'sauna_seed.json')

const BRREG = 'https://data.brreg.no'
const sleep = ms => new Promise(r => setTimeout(r, ms))

// NACE prefixes that plausibly cover sauna / wellness / leisure operators
const PLAUSIBLE_NACE = ['93.', '96.', '55.', '79.', '86.', '68.']

function loadOperators() {
  let src = fs.readFileSync(SOURCE, 'utf8')
  src = src.replace(/^import .*$/m, '')
  const helperIdx = src.indexOf('export function')
  if (helperIdx !== -1) src = src.slice(0, helperIdx)
  src = src.replace(/export const SAUNA_OPERATORS:\s*SaunaOperator\[\]\s*=/, 'globalThis.__OPS =')
  const ctx = { globalThis: {} }
  vm.createContext(ctx)
  vm.runInContext(src, ctx)
  return ctx.globalThis.__OPS
}

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return await res.json()
    } catch (e) {
      if (attempt === 2) { console.error('  fetch failed:', url, e.message); return null }
      await sleep(500 * (attempt + 1))
    }
  }
}

function normalizeName(n) {
  return n.toLowerCase()
    .replace(/\b(as|asa|da|ans|sa|ba|enk)\b/g, '')
    .replace(/[^a-z0-9æøå ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function searchEntity(name) {
  const clean = name.replace(/\(.*?\)/g, '').trim()
  const data = await getJson(`${BRREG}/enhetsregisteret/api/enheter?navn=${encodeURIComponent(clean)}&size=10`)
  const hits = data?._embedded?.enheter ?? []
  if (hits.length === 0) return { match: 'none', entity: null }

  const target = normalizeName(clean)
  const scored = hits.map(h => {
    const hn = normalizeName(h.navn)
    let score = 0
    if (hn === target) score += 4
    else if (hn.startsWith(target) || target.startsWith(hn)) score += 2.5
    else if (hn.includes(target) || target.includes(hn)) score += 1.5
    const nace = h.naeringskode1?.kode ?? ''
    if (PLAUSIBLE_NACE.some(p => nace.startsWith(p))) score += 1.5
    if (h.organisasjonsform?.kode === 'AS') score += 0.5
    if (h.slettedato || h.konkurs) score -= 5
    return { h, score }
  }).sort((a, b) => b.score - a.score)

  const best = scored[0]
  if (best.score >= 4.5) return { match: 'high', entity: best.h }
  if (best.score >= 2.5) return { match: 'uncertain', entity: best.h }
  return { match: 'none', entity: null }
}

// NOTE: the open Regnskapsregisteret API only serves the LATEST filed
// accounts — the documented `år` query param is ignored on the free tier.
// History therefore accumulates one year at a time (each refresh appends
// the newly filed year), or is entered manually per target from Proff.no.
async function fetchAccounts(orgnr) {
  const years = []
  const seen = new Set()
  const latest = await getJson(`${BRREG}/regnskapsregisteret/regnskap/${orgnr}`)
  const push = entry => {
    if (!entry) return
    const year = Number(entry.regnskapsperiode.tilDato.slice(0, 4))
    if (seen.has(year)) return
    seen.add(year)
    const r = entry.resultatregnskapResultat
    const ek = entry.egenkapitalGjeld
    years.push({
      year,
      revenue_nok: r?.driftsresultat?.driftsinntekter?.sumDriftsinntekter ?? null,
      ebit_nok: r?.driftsresultat?.driftsresultat ?? null,
      result_nok: r?.aarsresultat ?? null,
      equity_nok: ek?.egenkapital?.sumEgenkapital ?? null,
      debt_nok: ek?.gjeldOversikt?.sumGjeld ?? null,
    })
  }
  for (const entry of latest ?? []) push(entry)
  return years.sort((a, b) => b.year - a.year)
}

async function fetchRoles(orgnr) {
  const data = await getJson(`${BRREG}/enhetsregisteret/api/enheter/${orgnr}/roller`)
  if (!data?.rollegrupper) return { ceo: null, board: [], boardSize: 0 }
  let ceo = null
  const board = []
  for (const group of data.rollegrupper) {
    for (const role of group.roller ?? []) {
      if (role.fratraadt || role.avregistrert || !role.person) continue
      const name = [role.person.navn?.fornavn, role.person.navn?.mellomnavn, role.person.navn?.etternavn].filter(Boolean).join(' ')
      if (role.type?.kode === 'DAGL') ceo = name
      if (['LEDE', 'NEST', 'MEDL'].includes(role.type?.kode)) board.push(name)
    }
  }
  return { ceo, board, boardSize: board.length }
}

async function main() {
  const ops = loadOperators()
  console.log(`Loaded ${ops.length} operators from research file`)
  const out = []

  for (const op of ops) {
    process.stdout.write(`${op.name} ... `)
    let match = 'none', entity = null

    if (op.contact?.orgNumber) {
      const orgnr = op.contact.orgNumber.replace(/\s/g, '')
      entity = await getJson(`${BRREG}/enhetsregisteret/api/enheter/${orgnr}`)
      if (entity) match = 'confirmed'
    }
    if (!entity) {
      const res = await searchEntity(op.name)
      match = res.match
      entity = res.entity
    }

    let brreg = null
    if (entity) {
      const orgnr = entity.organisasjonsnummer
      const [accounts, roles] = [await fetchAccounts(orgnr), await fetchRoles(orgnr)]
      const latest = accounts[0] ?? null
      const prev = accounts[1] ?? null
      const yoy = latest?.revenue_nok && prev?.revenue_nok
        ? Math.round(((latest.revenue_nok - prev.revenue_nok) / prev.revenue_nok) * 1000) / 10
        : null
      brreg = {
        org_number: orgnr,
        legal_name: entity.navn,
        org_form: entity.organisasjonsform?.kode ?? null,
        nace: entity.naeringskode1 ? `${entity.naeringskode1.kode} ${entity.naeringskode1.beskrivelse}` : null,
        employees: entity.harRegistrertAntallAnsatte ? entity.antallAnsatte : null,
        founded: entity.stiftelsesdato ?? entity.registreringsdatoEnhetsregisteret ?? null,
        municipality: entity.forretningsadresse?.kommune ?? null,
        registry_email: entity.epostadresse ?? null,
        registry_website: entity.hjemmeside ?? null,
        ceo: roles.ceo,
        board: roles.board,
        owners_count: roles.boardSize || null,
        financials: accounts,
        revenue_nok: latest?.revenue_nok ?? null,
        revenue_year: latest?.year ?? null,
        ebit_nok: latest?.ebit_nok ?? null,
        yoy_growth_pct: yoy,
      }
      console.log(`${match} → ${entity.navn} (${orgnr})${latest ? ` rev ${Math.round((latest.revenue_nok ?? 0) / 1000)}k NOK ${latest.year}` : ' no accounts'}`)
    } else {
      console.log('no match')
    }

    out.push({ ...op, brreg_match: match, brreg })
    await sleep(150)
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1))
  const matched = out.filter(o => o.brreg).length
  const withRev = out.filter(o => o.brreg?.revenue_nok).length
  console.log(`\nDone. ${matched}/${out.length} matched, ${withRev} with filed revenue → ${OUT}`)
}

main()
