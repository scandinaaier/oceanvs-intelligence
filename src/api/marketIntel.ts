import { supabase } from '../lib/supabase'
import { CAPITAL_EVENTS } from '../data/mock/marketIntel'
import type { CityKey } from '../types'

// ─────────────────────────────────────────────────────────────
// Live market intelligence layer.
//
// LIVE API: Supabase tables `market_news` (written weekly by the
// news-refresh scheduled function from Google News RSS) and
// `capital_events` (curated in-app). Until migration 008 runs,
// the capital flow falls back to the bundled illustrative set,
// clearly labelled in the UI.
// ─────────────────────────────────────────────────────────────

export interface MarketNewsItem {
  id: string
  title: string
  title_original: string | null
  url: string
  source: string | null
  query_tag: string | null
  published_at: string | null
  fetched_at: string
  promoted: boolean
  archived: boolean
}

export interface DbCapitalEvent {
  id: string
  event_date: string
  investor: string
  target: string
  deal_eur: number | null
  subsector: string
  source_url: string | null
  notes: string | null
  created_by: string | null
}

export const DEAL_SUBSECTORS = [
  'Thermal & Sauna',
  'Camping & Outdoor',
  'Boutique Hotel',
  'Wellness Real Estate',
  'Longevity',
  'F&B Wellness',
] as const

// ── News ──────────────────────────────────────────────────

export async function fetchMarketNews(): Promise<{ items: MarketNewsItem[]; live: boolean }> {
  const { data, error } = await supabase
    .from('market_news')
    .select('*')
    .eq('archived', false)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(80)
  if (error) return { items: [], live: false } // table missing or not authorised
  return { items: (data ?? []) as MarketNewsItem[], live: true }
}

export async function updateMarketNews(id: string, updates: Partial<Pick<MarketNewsItem, 'promoted' | 'archived'>>): Promise<void> {
  const { error } = await supabase.from('market_news').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function triggerNewsRefresh(): Promise<{ harvested: number; errors: string[] }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sign in required')
  const res = await fetch('/.netlify/functions/news-refresh-now', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Refresh failed (${res.status})`)
  return body
}

// ── Capital flow ──────────────────────────────────────────

export interface CapitalFlowResult {
  events: DbCapitalEvent[]
  live: boolean // false = bundled illustrative fallback (migration 008 not applied)
}

export async function fetchCapitalFlow(city: CityKey): Promise<CapitalFlowResult> {
  const { data, error } = await supabase
    .from('capital_events')
    .select('*')
    .order('event_date', { ascending: false })
  if (!error) return { events: (data ?? []) as DbCapitalEvent[], live: true }

  // Fallback: the old illustrative dataset, mapped to the live shape
  const mock = (CAPITAL_EVENTS[city] ?? []).map(e => ({
    id: e.id,
    event_date: e.date,
    investor: e.investor,
    target: e.target,
    deal_eur: e.dealEur,
    subsector: e.subsector,
    source_url: null,
    notes: null,
    created_by: null,
  }))
  return { events: mock, live: false }
}

export interface NewDeal {
  event_date: string
  investor: string
  target: string
  deal_eur: number | null
  subsector: string
  source_url?: string | null
  notes?: string | null
  created_by?: string | null
}

export async function createDeal(deal: NewDeal): Promise<void> {
  const { error } = await supabase.from('capital_events').insert(deal)
  if (error) throw new Error(error.message)
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from('capital_events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
