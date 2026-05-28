import { supabase } from '../lib/supabase'
import type { TeamSignal, AssetClass, CityKey, Vertical, ThesisTag } from '../types'

// ── Fetch all non-archived signals, newest first ──────────
export async function fetchTeamSignals(): Promise<TeamSignal[]> {
  const { data, error } = await supabase
    .from('team_signals')
    .select('*')
    .eq('archived', false)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as TeamSignal[]
}

// ── Fetch signals for a specific city (for blending into City Overview) ──
export async function fetchTeamSignalsByCity(city: CityKey): Promise<TeamSignal[]> {
  const { data, error } = await supabase
    .from('team_signals')
    .select('*')
    .eq('city', city)
    .eq('archived', false)
    .order('submitted_at', { ascending: false })
    .limit(10)

  if (error) throw new Error(error.message)
  return (data ?? []) as TeamSignal[]
}

// ── Create a new signal ───────────────────────────────────
export interface NewTeamSignal {
  url?: string
  title: string
  description?: string
  asset_class: string
  city?: CityKey | null
  vertical?: Vertical | 'BOTH' | null
  thesis_tag?: ThesisTag | null
  tip_source?: string
  submitted_by: string
  notes?: string
}

export async function createTeamSignal(signal: NewTeamSignal): Promise<TeamSignal> {
  const { data, error } = await supabase
    .from('team_signals')
    .insert({
      url: signal.url || null,
      title: signal.title,
      description: signal.description || null,
      asset_class: signal.asset_class,
      city: signal.city || null,
      vertical: signal.vertical || null,
      thesis_tag: signal.thesis_tag || null,
      tip_source: signal.tip_source || null,
      submitted_by: signal.submitted_by,
      notes: signal.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as TeamSignal
}

// ── Archive (soft-delete) a signal ────────────────────────
export async function archiveTeamSignal(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_signals')
    .update({ archived: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ── Hard-delete a signal (used for clearing duplicates) ───
export async function deleteTeamSignal(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_signals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ── Asset classes (dynamic lookup) ────────────────────────
export async function fetchAssetClasses(): Promise<AssetClass[]> {
  const { data, error } = await supabase
    .from('asset_classes')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as AssetClass[]
}

export async function createAssetClass(name: string): Promise<AssetClass> {
  const { data, error } = await supabase
    .from('asset_classes')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as AssetClass
}
