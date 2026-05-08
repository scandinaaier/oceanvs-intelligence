import type { CityKey, Signal, Vertical } from '../../types'

export const FALLBACK_SIGNALS: Record<CityKey, Record<Vertical, Signal[]>> = {
  oslo: {
    COASTAL_HOTELS: [
      { id: 'sig-osl-c-1', name: 'Aker Brygge succession event imminent', insight: 'Two founder-led hotel operators in Aker Brygge entering succession decisions within Q3 2026.', direction: '↑', recency: '3d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osl-c-2', name: 'Bygdøy waterfront permit reform stalled', insight: 'Municipal council has paused proposed easing of coastal permits, sustaining supply scarcity through 2027.', direction: '→', recency: '6d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osl-c-3', name: 'NOK weakness lifts EUR-denominated ADR', insight: 'Sustained NOK softness has improved Oslo competitiveness for European HNWI inbound demand without local rate compression.', direction: '↑', recency: '12d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osl-c-4', name: 'Scandinavian PE circling Oslofjord inventory', insight: 'Two Nordic PE platforms have reportedly initiated due diligence on Oslofjord boutique inventory.', direction: '↑', recency: '2w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-osl-s-1', name: 'Floating sauna unit economics validated', insight: 'KOK and Sunn have both reported repeatable 28-month payback profiles, opening clear roll-up pathway.', direction: '↑', recency: '5d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-osl-s-2', name: 'Winter session ADR up 18% YoY', insight: 'Premium operators report 18% session ADR uplift through the November-March window with stable utilisation.', direction: '↑', recency: '9d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-osl-s-3', name: 'Cold plunge programming standardisation', insight: 'Contrast therapy ritualisation is now standard programming across Oslo premium operators.', direction: '↑', recency: '2w ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-osl-s-4', name: 'Mass-market scale operator opportunity', insight: 'Oslo Badstu Group footprint and growth trajectory create a defensible scale platform despite lower brand tier.', direction: '→', recency: '3w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  helsinki: {
    COASTAL_HOTELS: [
      { id: 'sig-hel-c-1', name: 'German family office allocation rising', insight: 'Multiple German and Dutch family offices have reportedly opened mandates for Finnish coastal real estate in Q1 2026.', direction: '↑', recency: '4d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-hel-c-2', name: 'Helsinki-Tallinn weekend traffic robust', insight: 'Cross-Baltic weekend leisure traffic now sustains 31% of off-peak boutique inventory.', direction: '↑', recency: '8d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-hel-c-3', name: 'Archipelago island development consent', insight: 'New consent framework for low-impact island development published, marginally improving asset availability.', direction: '↑', recency: '10d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-hel-c-4', name: 'Saaristo founder approaching exit', insight: 'Saaristo Island Hotel founder reportedly in informal sale dialogue with regional advisor.', direction: '↑', recency: '2w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-hel-s-1', name: 'Premium tier bifurcation accelerating', insight: 'Mid-tier Finnish sauna operators consolidating or closing; Löyly-tier and design-led second tier remain.', direction: '↑', recency: '6d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-hel-s-2', name: 'Sauna Demand Pressure: High', insight: 'Sub-zero conditions and overcast cloud cover supporting peak winter demand profile.', direction: '↑', recency: 'today', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-hel-s-3', name: 'Asian inbound wellness reframing', insight: 'Inbound Asian visitors increasingly book curated sauna experiences at 60% rate premium to standard.', direction: '↑', recency: '11d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-hel-s-4', name: 'Public sauna scale operator', insight: 'Helsinki Public Saunas footprint creates defensible scale platform; flagged as scale opportunity rather than premium positioning.', direction: '→', recency: '3w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  copenhagen: {
    COASTAL_HOTELS: [
      { id: 'sig-cph-c-1', name: 'Nordhavn premium cluster forming', insight: 'Three new boutique projects under contract in Nordhavn for 2027 opening, marking premium hospitality cluster formation.', direction: '↑', recency: '5d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-cph-c-2', name: 'Refshaleøen land values up 41%', insight: 'Industrial-to-cultural transition has lifted Refshaleøen land values 41% over 24 months.', direction: '↑', recency: '9d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-cph-c-3', name: 'Harbour bath wellness normalised', insight: 'Harbour-water wellness has normalised across inbound tourism programming, improving cross-sell economics.', direction: '↑', recency: '2w ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-cph-c-4', name: 'NREP harbour acquisition', insight: 'NREP completed €124M wellness real estate package in harbour district, validating institutional interest.', direction: '↑', recency: '3w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-cph-s-1', name: 'First-mover window narrowing', insight: 'Three credible new premium entrants in 18 months; first-mover window closes by mid-2027.', direction: '↑', recency: '4d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-cph-s-2', name: 'Kastrup zone growing demand', insight: 'Kastrup proximity to airport and demographic shift driving premium sauna demand growth.', direction: '↑', recency: '8d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-cph-s-3', name: 'La Banchina expansion plans', insight: 'La Banchina Sauna reportedly evaluating second location, signalling category maturation.', direction: '↑', recency: '12d ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  stockholm: {
    COASTAL_HOTELS: [
      { id: 'sig-sto-c-1', name: 'Inner archipelago premium expanding', insight: 'Inner archipelago inventory now commands 31% rate premium over central urban with lower seasonality.', direction: '↑', recency: '4d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-sto-c-2', name: 'Margin discipline gap quantified', insight: 'Stockholm hospitality assets show 200-300 bps EBITDA margin gap to Oslo and Copenhagen comparables.', direction: '→', recency: '7d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-sto-c-3', name: 'Djurgården heritage premium', insight: 'Djurgården heritage inventory increasingly priced as cultural asset rather than hospitality asset.', direction: '↑', recency: '10d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-sto-c-4', name: 'Foreign ownership disclosure tightening', insight: 'Updated disclosure requirements add timeline complexity but no fundamental blockers.', direction: '→', recency: '2w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-sto-s-1', name: 'Design-led operator emergence', insight: 'New cohort of design-led Stockholm sauna operators emerging from Fotografiska/lifestyle ecosystem.', direction: '↑', recency: '5d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-sto-s-2', name: 'Hellasgården floating expansion', insight: 'Hellasgården Floating reportedly considering second location in inner archipelago.', direction: '↑', recency: '9d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-sto-s-3', name: 'Wellness-F&B integration documented', insight: 'Integrated wellness-F&B contributes 8-12% to top line in Swedish premium hospitality.', direction: '↑', recency: '2w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  malta: {
    COASTAL_HOTELS: [
      { id: 'sig-mal-c-1', name: 'CGI residency inflow sustained', insight: 'CGI residency continues to drive 14% YoY HNWI footfall growth despite EU pressure.', direction: '↑', recency: '5d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-mal-c-2', name: 'Valletta heritage conversion premium', insight: 'Fortress-adjacent hospitality commands 39% EUR rate premium over generic Sliema inventory.', direction: '↑', recency: '8d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-mal-c-3', name: 'Mid-Europa Valletta closing', insight: 'Mid-Europa Partners closed €78M Valletta heritage portfolio, validating institutional interest.', direction: '↑', recency: '11d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-mal-c-4', name: 'Sub-3hr flight reach widening', insight: 'New direct routes from Frankfurt and Munich expand HNWI weekend reach.', direction: '↑', recency: '3w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-mal-s-1', name: 'Hammam-thermal hybrid feasibility', insight: 'Mediterranean hammam-thermal format setting category economics; pioneer operators currently sub-scale.', direction: '↑', recency: '6d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-mal-s-2', name: 'Year-round wellness reframing required', insight: 'Climate constrains Nordic sauna seasonality; framing must shift to year-round premium wellness.', direction: '→', recency: '10d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-mal-s-3', name: 'Membership models gaining traction', insight: 'HNWI demand profile favours membership over transactional access for premium wellness.', direction: '↑', recency: '2w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  greece: {
    COASTAL_HOTELS: [
      { id: 'sig-gre-c-1', name: 'Aman comparable demand validation', insight: 'Sustained Aman Amanzoe occupancy validates global luxury rate ceiling for Porto Heli micro-market.', direction: '↑', recency: '3d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-gre-c-2', name: 'Marina year-round footprint shift', insight: 'Marina community has shifted from seasonal to permanent HNWI footprint.', direction: '↑', recency: '7d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-gre-c-3', name: 'Blackstone Argolic acquisition', insight: 'Blackstone Real Estate completed €312M Argolic coastal estate transaction, top of cycle validation.', direction: '↑', recency: '11d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-gre-c-4', name: 'Golden Visa velocity sustained', insight: 'Golden Visa-driven HNWI real estate activity continues at 18% YoY despite price floor changes.', direction: '↑', recency: '2w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-gre-s-1', name: 'Aegean thermal heritage credibility', insight: 'Cultural lineage supports premium wellness positioning more authentically than imported Nordic format.', direction: '→', recency: '5d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-gre-s-2', name: 'Superyacht shoreside tendering', insight: 'Superyacht operators increasingly tender shoreside wellness as part of curated cruise experience.', direction: '↑', recency: '9d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-gre-s-3', name: 'Integrated resort model preferred', insight: 'Standalone premium sauna economics weak; integrated resort wellness is the deployment thesis.', direction: '→', recency: '2w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  },
  osaka: {
    COASTAL_HOTELS: [
      { id: 'sig-osa-c-1', name: 'Inbound luxury above 2019 levels', insight: 'Japan inbound luxury tourism structurally above 2019, with Osaka capturing higher share.', direction: '↑', recency: '4d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osa-c-2', name: 'Expo 2025 legacy infrastructure', insight: 'Expo 2025 has accelerated Osaka Bay regeneration by 7-10 years; legacy infrastructure now active.', direction: '↑', recency: '8d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osa-c-3', name: 'Tokyo-Kyoto-Osaka triangulation shift', insight: 'Luxury second-night stays favouring Osaka over Kyoto; demand restructuring durable.', direction: '↑', recency: '12d ago', vertical: 'COASTAL_HOTELS' },
      { id: 'sig-osa-c-4', name: 'Nakanoshima curated district', insight: 'Nakanoshima Island consolidating as curated premium district, supporting hospitality positioning.', direction: '↑', recency: '2w ago', vertical: 'COASTAL_HOTELS' }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sig-osa-s-1', name: 'Sento cultural repositioning', insight: 'Premium repositioning of indigenous bathing culture proven by Tokyo flagships, translating to Osaka.', direction: '↑', recency: '5d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-osa-s-2', name: 'Dotonbori HNWI demand proxy', insight: 'Premium Dotonbori F&B activity is the closest demand proxy for curated bathing destination.', direction: '↑', recency: '9d ago', vertical: 'PREMIUM_SAUNAS' },
      { id: 'sig-osa-s-3', name: 'Local operating partner critical', insight: 'Japanese hospitality acquisition without local operating depth carries asymmetric execution risk.', direction: '→', recency: '2w ago', vertical: 'PREMIUM_SAUNAS' }
    ]
  }
}
