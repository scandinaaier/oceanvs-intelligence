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
