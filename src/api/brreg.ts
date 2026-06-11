import type { BrregFields } from '../types'

// ─────────────────────────────────────────────────────────────
// Brønnøysundregisteret client.
//
// LIVE API: data.brreg.no via /.netlify/functions/brreg — the
// accounts endpoint (Regnskapsregisteret) does not send CORS
// headers, so all calls route through the purpose-built proxy.
// Run `netlify dev` locally if you need enrichment in dev.
// ─────────────────────────────────────────────────────────────

const FN = '/.netlify/functions/brreg'

export interface BrregSearchHit {
  org_number: string
  legal_name: string
  org_form: string | null
  nace: string | null
  municipality: string | null
  employees: number | null
}

export async function searchBrreg(name: string): Promise<BrregSearchHit[]> {
  const res = await fetch(`${FN}?action=search&name=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error(`Brreg search failed (${res.status})`)
  const data = await res.json()
  return data.hits ?? []
}

export interface BrregEnrichment extends Omit<BrregFields, 'brreg_match' | 'brreg_synced_at'> {
  registry_email: string | null
  registry_website: string | null
}

export async function enrichFromBrreg(orgNumber: string): Promise<BrregEnrichment> {
  const orgnr = orgNumber.replace(/\s/g, '')
  const res = await fetch(`${FN}?action=enrich&orgnr=${orgnr}`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Brreg enrichment failed (${res.status})`)
  }
  return res.json()
}
