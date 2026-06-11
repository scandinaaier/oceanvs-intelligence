// ─────────────────────────────────────────────────────────────
// Brønnøysundregisteret proxy — the registry's accounts API does
// not send CORS headers, so the browser cannot call it directly.
// This function ONLY talks to data.brreg.no (fixed host, no
// caller-supplied URLs), unlike the general fetch-url-meta proxy.
//
//   ?action=search&name=...     → entity name search (top 10)
//   ?action=enrich&orgnr=...    → entity + roles + 3yrs of accounts
// ─────────────────────────────────────────────────────────────

const BRREG = 'https://data.brreg.no'

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Brreg responded ${res.status}`)
  return res.json()
}

function mapAccounts(entry) {
  if (!entry) return null
  const r = entry.resultatregnskapResultat
  const ek = entry.egenkapitalGjeld
  return {
    year: Number(entry.regnskapsperiode.tilDato.slice(0, 4)),
    revenue_nok: r?.driftsresultat?.driftsinntekter?.sumDriftsinntekter ?? null,
    ebit_nok: r?.driftsresultat?.driftsresultat ?? null,
    result_nok: r?.aarsresultat ?? null,
    equity_nok: ek?.egenkapital?.sumEgenkapital ?? null,
    debt_nok: ek?.gjeldOversikt?.sumGjeld ?? null,
  }
}

exports.handler = async event => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  }
  try {
    const { action, orgnr, name } = event.queryStringParameters || {}

    if (action === 'search') {
      if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'name required' }) }
      const data = await getJson(`${BRREG}/enhetsregisteret/api/enheter?navn=${encodeURIComponent(name)}&size=10`)
      const hits = (data?._embedded?.enheter ?? []).map(h => ({
        org_number: h.organisasjonsnummer,
        legal_name: h.navn,
        org_form: h.organisasjonsform?.kode ?? null,
        nace: h.naeringskode1 ? `${h.naeringskode1.kode} ${h.naeringskode1.beskrivelse}` : null,
        municipality: h.forretningsadresse?.kommune ?? null,
        employees: h.harRegistrertAntallAnsatte ? h.antallAnsatte : null,
      }))
      return { statusCode: 200, headers, body: JSON.stringify({ hits }) }
    }

    if (action === 'enrich') {
      if (!/^\d{9}$/.test(orgnr || '')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'orgnr must be 9 digits' }) }
      }
      const entity = await getJson(`${BRREG}/enhetsregisteret/api/enheter/${orgnr}`)
      if (!entity) return { statusCode: 404, headers, body: JSON.stringify({ error: 'org not found' }) }

      // Roles: CEO + board
      let ceo = null
      const board = []
      const rolesData = await getJson(`${BRREG}/enhetsregisteret/api/enheter/${orgnr}/roller`).catch(() => null)
      for (const group of rolesData?.rollegrupper ?? []) {
        for (const role of group.roller ?? []) {
          if (role.fratraadt || role.avregistrert || !role.person) continue
          const n = [role.person.navn?.fornavn, role.person.navn?.mellomnavn, role.person.navn?.etternavn].filter(Boolean).join(' ')
          if (role.type?.kode === 'DAGL') ceo = n
          if (['LEDE', 'NEST', 'MEDL'].includes(role.type?.kode)) board.push(n)
        }
      }

      // Accounts — the open API only serves the latest filed year; the
      // documented `år` param is ignored on the free tier. Earlier years
      // come from manual entry (Proff.no) or accumulate as filings land.
      const financials = []
      const seenYears = new Set()
      const latest = await getJson(`${BRREG}/regnskapsregisteret/regnskap/${orgnr}`).catch(() => null)
      for (const entry of latest ?? []) {
        const mapped = mapAccounts(entry)
        if (mapped && !seenYears.has(mapped.year)) {
          seenYears.add(mapped.year)
          financials.push(mapped)
        }
      }
      financials.sort((a, b) => b.year - a.year)
      const cur = financials[0] ?? null
      const prev = financials[1] ?? null
      const yoy = cur?.revenue_nok && prev?.revenue_nok
        ? Math.round(((cur.revenue_nok - prev.revenue_nok) / prev.revenue_nok) * 1000) / 10
        : null

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          org_number: entity.organisasjonsnummer,
          legal_name: entity.navn,
          org_form: entity.organisasjonsform?.kode ?? null,
          nace: entity.naeringskode1 ? `${entity.naeringskode1.kode} ${entity.naeringskode1.beskrivelse}` : null,
          employees: entity.harRegistrertAntallAnsatte ? entity.antallAnsatte : null,
          founded: entity.stiftelsesdato ?? entity.registreringsdatoEnhetsregisteret ?? null,
          municipality: entity.forretningsadresse?.kommune ?? null,
          registry_email: entity.epostadresse ?? null,
          registry_website: entity.hjemmeside ?? null,
          ceo_name: ceo,
          board,
          owners_count: board.length || null,
          financials,
          revenue_nok: cur?.revenue_nok ?? null,
          revenue_year: cur?.year ?? null,
          ebit_nok: cur?.ebit_nok ?? null,
          yoy_growth_pct: yoy,
        }),
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'unknown action' }) }
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) }
  }
}
