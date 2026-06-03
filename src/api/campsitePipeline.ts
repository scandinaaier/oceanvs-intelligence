import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────
export interface CampsiteListing {
  id: string
  finnkode: string | null
  url: string | null
  title: string
  description: string | null
  price_nok: number
  currency: string
  location: string | null
  region: string | null
  images: string[]
  plot_size: string | null
  building_area: string | null
  property_type: string | null
  waterfront: boolean
  pitches: number | null
  status: 'new' | 'watching' | 'contacted' | 'active' | 'passed'
  notes: string | null
  added_by: string | null
  added_at: string
  updated_at: string
  scraped_at: string | null
}

// ── Fetch all campsites ───────────────────────────────────
export async function fetchCampsites(): Promise<CampsiteListing[]> {
  const { data, error } = await supabase
    .from('campsite_pipeline')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as CampsiteListing[]
}

// ── Create a new campsite listing ─────────────────────────
export interface NewCampsite {
  finnkode?: string
  url?: string
  title: string
  description?: string
  price_nok?: number
  currency?: string
  location?: string
  region?: string
  images?: string[]
  plot_size?: string
  building_area?: string
  property_type?: string
  waterfront?: boolean
  pitches?: number
  notes?: string
  added_by?: string
  scraped_at?: string
}

export async function createCampsite(c: NewCampsite): Promise<CampsiteListing> {
  const { data, error } = await supabase
    .from('campsite_pipeline')
    .insert({
      finnkode: c.finnkode || null,
      url: c.url || null,
      title: c.title,
      description: c.description || null,
      price_nok: c.price_nok || 0,
      currency: c.currency || 'NOK',
      location: c.location || null,
      region: c.region || null,
      images: c.images || [],
      plot_size: c.plot_size || null,
      building_area: c.building_area || null,
      property_type: c.property_type || null,
      waterfront: c.waterfront ?? false,
      pitches: c.pitches || null,
      notes: c.notes || null,
      added_by: c.added_by || null,
      scraped_at: c.scraped_at || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as CampsiteListing
}

// ── Update status or notes ────────────────────────────────
export async function updateCampsite(id: string, updates: Partial<CampsiteListing>): Promise<void> {
  const { error } = await supabase
    .from('campsite_pipeline')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ── Seed from scraped JSON data ───────────────────────────
export async function seedCampsites(listings: NewCampsite[]): Promise<number> {
  let count = 0
  for (const listing of listings) {
    try {
      // Upsert by finnkode to avoid duplicates
      if (listing.finnkode) {
        const { data: existing } = await supabase
          .from('campsite_pipeline')
          .select('id')
          .eq('finnkode', listing.finnkode)
          .single()

        if (existing) continue // skip duplicates
      }
      await createCampsite(listing)
      count++
    } catch (e) {
      console.error('Failed to seed:', listing.title, e)
    }
  }
  return count
}
