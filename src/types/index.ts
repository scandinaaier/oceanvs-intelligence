export type Vertical = 'COASTAL_HOTELS' | 'PREMIUM_SAUNAS'
export type Tier = 'ACTIVE_ROLLUP' | 'INVESTOR_LED'

export type CityKey =
  | 'oslo'
  | 'helsinki'
  | 'copenhagen'
  | 'stockholm'
  | 'malta'
  | 'greece'
  | 'osaka'

export interface CityMeta {
  key: CityKey
  name: string
  country: string
  tier: Tier
  currency: string
  lat: number
  lon: number
}

export interface CityKpi {
  lmi: number
  activeOperators?: number
  hnwiConvergence?: 'Low' | 'Medium' | 'High' | 'Critical'
  avgADR: number
  acquisitionWindow?: 'Open' | 'Narrowing' | 'Closed'
  investorReadiness?: number
}

export interface Signal {
  id: string
  name: string
  insight: string
  direction: '↑' | '↓' | '→'
  recency: string
  vertical?: Vertical | 'BOTH'
  source?: string
  isLive?: boolean
}

export interface Operator {
  id: string
  name: string
  city: CityKey
  vertical: Vertical
  coastalRating: number
  keysOrSessions: number
  unitLabel: string
  estRevenueEur: number
  lmiFit: number
  acquisitionReadiness: number
  status: 'Monitoring' | 'Active Interest' | 'In Dialogue'
  scaleOpportunity?: boolean
  askingPriceMin?: number
  askingPriceMax?: number
  estEbitda?: number
}

export interface CapitalEvent {
  id: string
  date: string
  investor: string
  target: string
  dealEur: number
  subsector: 'Thermal & Sauna' | 'Boutique Hotel' | 'Wellness Real Estate' | 'Longevity' | 'F&B Wellness'
}

export interface TrendCard {
  id: string
  name: string
  momentum: number
  vertical: Vertical | 'BOTH'
  insight: string
  timeToMainstream: string
}

export interface BrandDeployment {
  asset: { title: string; description: string; ownership: string; coastalAccess: string; scale: string }
  investor: {
    status: 'Identified' | 'In Dialogue' | 'Term Sheet' | 'Committed'
    profile: string
    dependencies: string
  }
  timeline: { phase: string; duration: string; milestone: string; current?: boolean }[]
}

export interface LmiBreakdown {
  total: number
  components: {
    name: string
    score: number
    insight: string
  }[]
  trend: { month: string; score: number }[]
  comparables: { city: string; score: number; note: string }[]
}

export interface GapMarket {
  id: string
  name: string
  country: string
  lmi: number
  vertical: Vertical
  rationale: string
}

// ── Signal Capture ────────────────────────────────────────
export type ThesisTag =
  | 'undervalued_coastal'
  | 'nordic_wellness_demand'
  | 'consolidation_play'
  | 'climate_migration'
  | 'emerging_asset_class'

export interface TeamSignal {
  id: string
  url: string | null
  title: string
  description: string | null
  asset_class: string
  city: CityKey | null
  vertical: Vertical | 'BOTH' | null
  thesis_tag: ThesisTag | null
  tip_source: string | null
  submitted_by: string
  submitted_at: string
  notes: string | null
  archived: boolean
}

export interface AssetClass {
  id: number
  name: string
  created_at: string
}

// ── Roll-Up CRM ───────────────────────────────────────────
export type RollupStage =
  | 'prospect'
  | 'outreach_sent'
  | 'engaged'
  | 'meeting_booked'
  | 'loi'
  | 'acquired'
  | 'passed'

export type RollupPriority = 'high' | 'medium' | 'low'
export type BrregMatch = 'confirmed' | 'high' | 'uncertain' | 'none'
export type ActivityChannel = 'email' | 'call' | 'meeting' | 'note' | 'linkedin' | 'site_visit'

export const ROLLUP_STAGES: { id: RollupStage; label: string }[] = [
  { id: 'prospect', label: 'Prospect' },
  { id: 'outreach_sent', label: 'Outreach Sent' },
  { id: 'engaged', label: 'Engaged' },
  { id: 'meeting_booked', label: 'Meeting Booked' },
  { id: 'loi', label: 'Under LOI' },
  { id: 'acquired', label: 'Acquired' },
  { id: 'passed', label: 'Passed' },
]

export interface YearFinancials {
  year: number
  revenue_nok: number | null
  ebit_nok: number | null
  result_nok: number | null
  equity_nok: number | null
  debt_nok: number | null
}

/** Fields shared by both target types (CRM layer) */
export interface CrmFields {
  stage: RollupStage
  priority: RollupPriority
  assigned_to: string | null
  last_contact_at: string | null
  contact_email: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_source: string | null
  estimated_valuation: string | null
  tags: string[]
  crm_notes: string | null
}

/** Fields populated from Brønnøysundregisteret */
export interface BrregFields {
  org_number: string | null
  legal_name: string | null
  org_form: string | null
  nace: string | null
  employees: number | null
  founded: string | null
  municipality: string | null
  ceo_name: string | null
  board: string[]
  owners_count: number | null
  financials: YearFinancials[]
  revenue_nok: number | null
  revenue_year: number | null
  ebit_nok: number | null
  yoy_growth_pct: number | null
  brreg_match: BrregMatch
  brreg_synced_at: string | null
}

export interface SaunaTarget extends CrmFields, BrregFields {
  id: string
  slug: string
  name: string
  region: string | null
  sub_region: string | null
  operator_type: string | null
  format: string | null
  ownership_model: string | null
  water_access: string | null
  price_range: string | null
  booking_model: string | null
  year_est: string | null
  website: string | null
  intel_notes: string | null
  is_multi_site: boolean
  locations_count: number
  cabins_count: number | null
}

export interface CampsiteTarget extends CrmFields, BrregFields {
  id: string
  source_id: string
  name: string
  country: string
  county: string | null
  address: string | null
  lat: number | null
  lng: number | null
  water_type: string | null
  water_name: string | null
  nearest_city: string | null
  city_dist_km: number | null
  is_waterfront: boolean
  has_beach: boolean
  has_swimming: boolean
  has_sauna: boolean
  facilities: string[]
  website: string | null
  // Land economics
  plot_sqm: number | null
  asking_price_nok: number | null
}

export interface CrmActivity {
  id: string
  target_type: 'sauna' | 'campsite'
  target_id: string
  actor: string
  channel: ActivityChannel
  summary: string
  stage_at_time: string | null
  occurred_at: string
}

export interface RollupEmailTemplate {
  id: string
  name: string
  segment: string
  subject: string
  body: string
  tokens: string[]
}
