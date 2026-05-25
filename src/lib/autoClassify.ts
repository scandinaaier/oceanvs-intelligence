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
  const hotelScore = countHits(text, HOTEL_KEYWORDS)
  const saunaScore = countHits(text, SAUNA_KEYWORDS)
  const campingScore = countHits(text, CAMPING_KEYWORDS)
  const waterfrontScore = countHits(text, WATERFRONT_KEYWORDS)

  // Determine vertical
  let vertical: Vertical | 'BOTH' | null = null
  if (hotelScore > 0 && saunaScore > 0) vertical = 'BOTH'
  else if (hotelScore > saunaScore) vertical = 'COASTAL_HOTELS'
  else if (saunaScore > 0) vertical = 'PREMIUM_SAUNAS'

  // Determine asset class (most specific wins)
  let asset_class: string | null = null
  if (campingScore > 0) asset_class = 'Camping Ground'
  else if (hotelScore > 0) asset_class = 'Boutique Hotel'
  else if (saunaScore > 0) asset_class = 'Premium Sauna'
  else if (waterfrontScore > 0) asset_class = 'Waterfront Property'

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

// ── Finn.no URL detection ─────────────────────────────────
export function isFinnUrl(url: string): boolean {
  return /finn\.no\/realestate/.test(url)
}

export function extractFinnkode(url: string): string | null {
  const match = url.match(/finnkode=(\d+)/)
  return match ? match[1] : null
}
