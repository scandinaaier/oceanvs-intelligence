import type { CityKey, LmiBreakdown } from '../../types'

const COMPONENT_NAMES = [
  'Premium Membership Density',
  'HNWI Convergence Signal',
  'Coastal Access Quality',
  'Wellness Spend Index',
  'Regulatory Openness'
]

const trend = (start: number, shape: 'up' | 'flat' | 'dip-recover' | 'down-stable'): { month: string; score: number }[] => {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const out: { month: string; score: number }[] = []
  for (let i = 0; i < 12; i++) {
    let s = start
    if (shape === 'up') s = start - 8 + (i * 0.7)
    else if (shape === 'flat') s = start + (Math.sin(i / 2) * 1.5)
    else if (shape === 'dip-recover') s = start - (i < 5 ? i : Math.max(0, 10 - i)) * 1.4
    else if (shape === 'down-stable') s = start + 4 - (i * 0.4)
    out.push({ month: months[i], score: Math.round(s * 10) / 10 })
  }
  return out
}

export const LMI_DATA: Record<CityKey, LmiBreakdown> = {
  oslo: {
    total: 85,
    components: [
      { name: COMPONENT_NAMES[0], score: 17, insight: 'Oslo has a tight, well-curated premium club and members-only dining ecosystem with notable concentration around Aker Brygge and the city centre.' },
      { name: COMPONENT_NAMES[1], score: 18, insight: 'Norwegian sovereign wealth distributions and resource-economy family wealth produce HNWI density disproportionate to city size.' },
      { name: COMPONENT_NAMES[2], score: 19, insight: 'Oslofjord access is exceptional and tightly constrained by municipal planning, supporting structural scarcity for waterfront product.' },
      { name: COMPONENT_NAMES[3], score: 16, insight: 'Norwegian per-capita wellness spending is among the highest in Europe, with strong conversion from disposable income to recurring wellness commitments.' },
      { name: COMPONENT_NAMES[4], score: 15, insight: 'Coastal permits are strict but predictable; foreign ownership rules are clear and hospitality licensing is well-mapped.' }
    ],
    trend: trend(85, 'up'),
    comparables: [
      { city: 'Bergen', score: 71, note: 'Norwegian secondary market with similar wellness-spend dynamics but weaker HNWI concentration.' },
      { city: 'Gothenburg', score: 68, note: 'Comparable Nordic urban model with weaker coastal exclusivity.' },
      { city: 'Amsterdam', score: 73, note: 'Strong premium membership density but constrained coastal asset thesis.' }
    ]
  },
  helsinki: {
    total: 79,
    components: [
      { name: COMPONENT_NAMES[0], score: 14, insight: 'Helsinki premium membership scene is design-led but smaller in absolute terms than other Nordic capitals.' },
      { name: COMPONENT_NAMES[1], score: 15, insight: 'HNWI activity is concentrated and growing, supported by increased family-office allocation to Finnish coastal real estate.' },
      { name: COMPONENT_NAMES[2], score: 20, insight: 'Helsinki archipelago provides globally unmatched coastal access within capital-city reach.' },
      { name: COMPONENT_NAMES[3], score: 17, insight: 'Wellness spending in Finland is structurally embedded in the consumer budget at all income tiers, not just premium.' },
      { name: COMPONENT_NAMES[4], score: 13, insight: 'Regulatory environment is generally open but island development and heritage permitting carry timeline risk.' }
    ],
    trend: trend(79, 'flat'),
    comparables: [
      { city: 'Tallinn', score: 64, note: 'Cross-Baltic comparable with growing premium scene but limited HNWI base.' },
      { city: 'Riga', score: 58, note: 'Baltic peer at earlier development stage with regulatory complexity.' },
      { city: 'Reykjavik', score: 67, note: 'Smaller market with comparable wellness culture but limited HNWI density.' }
    ]
  },
  copenhagen: {
    total: 78,
    components: [
      { name: COMPONENT_NAMES[0], score: 16, insight: 'Copenhagen has a sophisticated, design-literate premium membership ecosystem with strong international cross-pollination.' },
      { name: COMPONENT_NAMES[1], score: 16, insight: 'HNWI presence is moderate but institutionally concentrated, with strong Scandinavian and German family-office activity.' },
      { name: COMPONENT_NAMES[2], score: 17, insight: 'Harbour and Øresund access is strong; coastal exclusivity is moderate and shaped by harbour-bath cultural normalisation.' },
      { name: COMPONENT_NAMES[3], score: 16, insight: 'Wellness spend is structural rather than aspirational, integrated into daily consumer behaviour and well-supported by category brands.' },
      { name: COMPONENT_NAMES[4], score: 13, insight: 'Danish regulatory environment is open and predictable but moves more slowly on heritage and harbour zoning.' }
    ],
    trend: trend(78, 'up'),
    comparables: [
      { city: 'Aarhus', score: 62, note: 'Danish secondary market with growing wellness scene.' },
      { city: 'Hamburg', score: 70, note: 'Northern European peer with comparable harbour culture.' },
      { city: 'Berlin', score: 66, note: 'Strong premium scene but limited coastal access.' }
    ]
  },
  stockholm: {
    total: 76,
    components: [
      { name: COMPONENT_NAMES[0], score: 17, insight: 'Stockholm premium membership scene is mature and design-led, anchored by Fotografiska-adjacent lifestyle ecosystem.' },
      { name: COMPONENT_NAMES[1], score: 15, insight: 'HNWI density is strong but distributed across a wider geography than Oslo, including Lidingö and the inner archipelago.' },
      { name: COMPONENT_NAMES[2], score: 16, insight: 'Stockholm archipelago is exceptional but central waterfront is constrained, shifting deployment economics outward.' },
      { name: COMPONENT_NAMES[3], score: 16, insight: 'Swedish premium wellness spending is well-developed but more discretionary than in Norway or Finland.' },
      { name: COMPONENT_NAMES[4], score: 12, insight: 'Foreign ownership disclosure and seasonal labour structures add complexity; navigable but slower than Norway.' }
    ],
    trend: trend(76, 'dip-recover'),
    comparables: [
      { city: 'Gothenburg', score: 68, note: 'Swedish secondary market with weaker premium membership density.' },
      { city: 'Oslo', score: 85, note: 'Direct Nordic peer with stronger HNWI and coastal access.' },
      { city: 'Helsinki', score: 79, note: 'Cross-Baltic peer with stronger archipelago thesis.' }
    ]
  },
  malta: {
    total: 68,
    components: [
      { name: COMPONENT_NAMES[0], score: 12, insight: 'Premium membership density in Malta is nascent, with most luxury infrastructure organised around hotels rather than independent clubs.' },
      { name: COMPONENT_NAMES[1], score: 16, insight: 'CGI residency and tax structuring drive material HNWI inflow; concentration around Sliema and St. Julian\'s.' },
      { name: COMPONENT_NAMES[2], score: 15, insight: 'Coastal access is abundant but exclusivity is constrained by historical public-access patterns and heritage protection.' },
      { name: COMPONENT_NAMES[3], score: 12, insight: 'Wellness spend on the island is growing but starts from a low base, with HNWI demand outpacing local infrastructure.' },
      { name: COMPONENT_NAMES[4], score: 13, insight: 'Maltese hospitality licensing is open to foreign capital but heritage permitting is slow and politically sensitive.' }
    ],
    trend: trend(68, 'up'),
    comparables: [
      { city: 'Mallorca', score: 74, note: 'Mediterranean peer with stronger premium hospitality infrastructure.' },
      { city: 'Cyprus (Limassol)', score: 65, note: 'Comparable HNWI inflow profile with weaker coastal exclusivity.' },
      { city: 'Sicily (Taormina)', score: 76, note: 'Heritage-led peer with deeper cultural anchoring.' }
    ]
  },
  greece: {
    total: 81,
    components: [
      { name: COMPONENT_NAMES[0], score: 14, insight: 'Porto Heli premium membership infrastructure is concentrated around the marina community; thin in absolute terms but dense relative to footfall.' },
      { name: COMPONENT_NAMES[1], score: 19, insight: 'Argolida coast HNWI convergence is at the global luxury ceiling, validated by sustained Aman Amanzoe occupancy.' },
      { name: COMPONENT_NAMES[2], score: 18, insight: 'Coves, deep-water marina access, and protected coastline create coastal exclusivity rivalling any Mediterranean micro-market.' },
      { name: COMPONENT_NAMES[3], score: 16, insight: 'Wellness spend is high among the resident HNWI cohort; broader Greek consumer wellness spend is a separate, less relevant market.' },
      { name: COMPONENT_NAMES[4], score: 14, insight: 'Greek planning and environmental permitting are improving but remain a meaningful timeline risk on coastal assets.' }
    ],
    trend: trend(81, 'up'),
    comparables: [
      { city: 'Mykonos', score: 73, note: 'Cyclades peer with stronger seasonality concentration and weaker year-round HNWI base.' },
      { city: 'Bodrum', score: 72, note: 'Aegean peer with comparable marina cluster but weaker regulatory predictability.' },
      { city: 'Cap Ferrat', score: 88, note: 'Global luxury benchmark with denser HNWI concentration.' }
    ]
  },
  osaka: {
    total: 73,
    components: [
      { name: COMPONENT_NAMES[0], score: 14, insight: 'Osaka premium membership ecosystem is concentrated in Dotonbori and Namba F&B, with limited dedicated club infrastructure relative to Tokyo.' },
      { name: COMPONENT_NAMES[1], score: 16, insight: 'HNWI footfall is rising sharply, supported by inbound luxury tourism above 2019 levels and improved second-night-stay capture.' },
      { name: COMPONENT_NAMES[2], score: 15, insight: 'Osaka Bay coastal access is improving rapidly through Nakanoshima regeneration and Expo 2025 legacy infrastructure.' },
      { name: COMPONENT_NAMES[3], score: 16, insight: 'Japanese premium wellness spending is structural and supported by indigenous bathing tradition that translates well to luxury repositioning.' },
      { name: COMPONENT_NAMES[4], score: 12, insight: 'Japanese regulatory environment is open to foreign capital but operating licences require strong local partnership to navigate.' }
    ],
    trend: trend(73, 'up'),
    comparables: [
      { city: 'Tokyo', score: 84, note: 'Domestic peer with denser premium membership infrastructure.' },
      { city: 'Kyoto', score: 70, note: 'Cultural peer with limited coastal access.' },
      { city: 'Fukuoka', score: 64, note: 'Coastal Japanese peer at earlier development stage.' }
    ]
  }
}
