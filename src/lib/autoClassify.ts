import type { Vertical, ThesisTag } from '../types'

// ── Auto-classify signals based on text content ───────────
// Scans title + description for keywords and suggests vertical, asset class, and thesis tag

interface Classification {
  vertical: Vertical | 'BOTH' | null
  asset_class: string | null
  thesis_tag: ThesisTag | null
}

const HOTEL_KEYWORDS = [
  'hotel', 'hotell', 'gjestehus', 'overnatting', 'overnattingssted',
  'boutique hotel', 'resort', 'lodge', 'pensjonat', 'rooms', 'rom',
  'b&b', 'bed and breakfast',
]

const SAUNA_KEYWORDS = [
  'sauna', 'badstu', 'badstugruppen', 'spa', 'wellness', 'bastu',
  'hammam', 'thermal', 'dampbad', 'floating sauna', 'flytende badstu',
]

const CAMPING_KEYWORDS = [
  'camping', 'campingplass', 'leirplass', 'teltplass', 'camp',
  'caravan', 'bobil', 'rv-park', 'rv park', 'wohnmobil',
  'hytteutleie', 'friluft', 'familiecamping',
]

const WATERFRONT_KEYWORDS = [
  'sjøtomt', 'sjøfront', 'waterfront', 'vannkant', 'strandlinje',
  'brygge', 'kai', 'marina', 'naust', 'sjøhus', 'havutsikt',
  'fjordutsikt', 'sjønært', 'strand', 'tomt', 'eiendom',
]

const COMMERCIAL_WATERFRONT_KEYWORDS = [
  'næringseiendom', 'næringsbygg', 'næringsareal', 'næring',
  'commercial building', 'commercial property', 'commercially zoned',
  'service center', 'service centre', 'kombinert bolig', 'combined use',
  'mixed use', 'mixed-use', 'forretning', 'office building',
  'warehousing', 'industrial waterfront',
]

const MARKET_INTEL_KEYWORDS = [
  'solo traveller', 'solo travel', 'solo tourist',
  'linkedin', 'article', 'report', 'study', 'insight', 'whitepaper',
  'merger', 'acquisition news', 'market outlook', 'industry trend',
  'growth forecast', 'demand outlook', 'hospitality market',
  'wellness trend', 'travel trend', 'investor update', 'press release',
]

const THESIS_INDICATORS: { keywords: string[]; tag: ThesisTag }[] = [
  { keywords: ['underpriced', 'underpriset', 'under takst', 'redusert', 'billig', 'selges raskt'], tag: 'undervalued_coastal' },
  { keywords: ['wellness', 'helse', 'mental health', 'recovery', 'restorative'], tag: 'nordic_wellness_demand' },
  { keywords: ['consolidate', 'konsolidering', 'roll-up', 'rollup', 'portfolio', 'multiple'], tag: 'consolidation_play' },
  { keywords: ['climate', 'klima', 'migration', 'remote work', 'digital nomad'], tag: 'climate_migration' },
  { keywords: ['camping', 'campingplass', 'leirplass', 'new asset', 'emerging'], tag: 'emerging_asset_class' },
]

function countHits(text: string, keywords: string[]): number {
  return keywords.filter(kw => text.includes(kw)).length
}

export function autoClassify(title: string, description?: string): Classification {
  const text = `${title} ${description || ''}`.toLowerCase()

  // Score each category
  const hotelScore        = countHits(text, HOTEL_KEYWORDS)
  const saunaScore        = countHits(text, SAUNA_KEYWORDS)
  const campingScore      = countHits(text, CAMPING_KEYWORDS)
  const waterfrontScore   = countHits(text, WATERFRONT_KEYWORDS)
  const commercialScore   = countHits(text, COMMERCIAL_WATERFRONT_KEYWORDS)
  const marketIntelScore  = countHits(text, MARKET_INTEL_KEYWORDS)

  // Determine vertical (only set for property-type signals)
  let vertical: Vertical | 'BOTH' | null = null
  if (hotelScore > 0 && saunaScore > 0) vertical = 'BOTH'
  else if (hotelScore > saunaScore) vertical = 'COASTAL_HOTELS'
  else if (saunaScore > 0) vertical = 'PREMIUM_SAUNAS'

  // Determine asset class — specificity order matters
  // Property signals first, then commercial waterfront, then catch-all waterfront, then intel
  let asset_class: string | null = null
  if (campingScore > 0)                          asset_class = 'Camping Ground'
  else if (hotelScore > 0)                       asset_class = 'Boutique Hotel'
  else if (saunaScore > 0)                       asset_class = 'Premium Sauna'
  else if (commercialScore > 0)                  asset_class = 'Commercial Waterfront'
  else if (waterfrontScore > 0)                  asset_class = 'Waterfront Property'
  else if (marketIntelScore > 0)                 asset_class = 'Market Intelligence'

  // Determine thesis tag
  let thesis_tag: ThesisTag | null = null
  let maxHits = 0
  for (const { keywords, tag } of THESIS_INDICATORS) {
    const hits = countHits(text, keywords)
    if (hits > maxHits) {
      maxHits = hits
      thesis_tag = tag
    }
  }

  return { vertical, asset_class, thesis_tag }
}

// ── URL helpers ───────────────────────────────────────────
export function isFinnUrl(url: string): boolean {
  return /finn\.no\/realestate/.test(url)
}

export function extractFinnkode(url: string): string | null {
  const match = url.match(/finnkode=(\d+)/)
  return match ? match[1] : null
}

// ── Campsite detection ────────────────────────────────────
// Used to decide whether to also create a Campsite Pipeline entry
const CAMPSITE_STRONG = ['campingplass', 'camping', 'leirplass', 'teltplass', 'familiecamping']
const CAMPSITE_SUPPORTING = ['sjø', 'strand', 'fjord', 'brygge', 'sjøfront', 'waterfront']

export function isCampsiteSignal(title: string, description?: string): boolean {
  const text = `${title} ${description || ''}`.toLowerCase()
  const strongHits = CAMPSITE_STRONG.filter(kw => text.includes(kw)).length
  const supportingHits = CAMPSITE_SUPPORTING.filter(kw => text.includes(kw)).length
  return strongHits >= 1 || (strongHits === 0 && supportingHits >= 2)
}

// ── URL metadata via Netlify function ─────────────────────
export interface UrlMeta {
  title: string
  description: string
  image: string
  images: string[]
  siteName: string
  priceNok: number
  finnkode: string | null
  location: string
  region: string
  isFinn: boolean
  url: string
  error?: string
  partial?: boolean
}

export async function fetchUrlMeta(url: string): Promise<UrlMeta | null> {
  try {
    const endpoint = `/.netlify/functions/fetch-url-meta?url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
