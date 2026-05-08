import type { CityMeta, CityKey, CityKpi, Vertical } from '../../types'

export const CITIES: CityMeta[] = [
  { key: 'oslo', name: 'Oslo', country: 'Norway', tier: 'ACTIVE_ROLLUP', currency: 'NOK', lat: 59.91, lon: 10.75 },
  { key: 'helsinki', name: 'Helsinki', country: 'Finland', tier: 'ACTIVE_ROLLUP', currency: 'EUR', lat: 60.17, lon: 24.94 },
  { key: 'copenhagen', name: 'Copenhagen', country: 'Denmark', tier: 'ACTIVE_ROLLUP', currency: 'DKK', lat: 55.68, lon: 12.57 },
  { key: 'stockholm', name: 'Stockholm', country: 'Sweden', tier: 'ACTIVE_ROLLUP', currency: 'SEK', lat: 59.33, lon: 18.07 },
  { key: 'malta', name: 'Malta', country: 'Malta', tier: 'INVESTOR_LED', currency: 'EUR', lat: 35.90, lon: 14.51 },
  { key: 'greece', name: 'Porto Heli', country: 'Greece', tier: 'INVESTOR_LED', currency: 'EUR', lat: 37.33, lon: 23.15 },
  { key: 'osaka', name: 'Osaka', country: 'Japan', tier: 'INVESTOR_LED', currency: 'JPY', lat: 34.69, lon: 135.50 }
]

export const CITY_KPIS: Record<CityKey, Record<Vertical, CityKpi>> = {
  oslo: {
    COASTAL_HOTELS: { lmi: 82, activeOperators: 7, avgADR: 412, acquisitionWindow: 'Narrowing' },
    PREMIUM_SAUNAS: { lmi: 88, activeOperators: 9, avgADR: 95, acquisitionWindow: 'Open' }
  },
  helsinki: {
    COASTAL_HOTELS: { lmi: 74, activeOperators: 5, avgADR: 298, acquisitionWindow: 'Open' },
    PREMIUM_SAUNAS: { lmi: 91, activeOperators: 11, avgADR: 78, acquisitionWindow: 'Narrowing' }
  },
  copenhagen: {
    COASTAL_HOTELS: { lmi: 79, activeOperators: 6, avgADR: 365, acquisitionWindow: 'Open' },
    PREMIUM_SAUNAS: { lmi: 71, activeOperators: 4, avgADR: 88, acquisitionWindow: 'Open' }
  },
  stockholm: {
    COASTAL_HOTELS: { lmi: 76, activeOperators: 6, avgADR: 342, acquisitionWindow: 'Open' },
    PREMIUM_SAUNAS: { lmi: 73, activeOperators: 5, avgADR: 82, acquisitionWindow: 'Open' }
  },
  malta: {
    COASTAL_HOTELS: { lmi: 68, hnwiConvergence: 'High', avgADR: 485, investorReadiness: 8 },
    PREMIUM_SAUNAS: { lmi: 58, hnwiConvergence: 'Medium', avgADR: 110, investorReadiness: 6 }
  },
  greece: {
    COASTAL_HOTELS: { lmi: 81, hnwiConvergence: 'Critical', avgADR: 1240, investorReadiness: 9 },
    PREMIUM_SAUNAS: { lmi: 69, hnwiConvergence: 'High', avgADR: 165, investorReadiness: 7 }
  },
  osaka: {
    COASTAL_HOTELS: { lmi: 72, hnwiConvergence: 'High', avgADR: 520, investorReadiness: 7 },
    PREMIUM_SAUNAS: { lmi: 80, hnwiConvergence: 'High', avgADR: 145, investorReadiness: 8 }
  }
}

export const CITY_BRIEFS: Record<CityKey, Record<Vertical, string[]>> = {
  oslo: {
    COASTAL_HOTELS: [
      'Oslo represents the highest-conviction Active Rollup target in the Oceanvs portfolio for coastal hotels. Municipal planning restrictions on Oslofjord-adjacent development have constrained new supply for the past decade, creating a structural scarcity premium that ADR data clearly reflects. Existing operators control the only viable inventory at scale.',
      'Aker Brygge and the Bygdøy peninsula are the two focal acquisition zones. Both contain sub-40-key boutique inventory held by founder-operators approaching natural succession events. The fragmentation is genuine: no single group holds more than three properties, and brand consolidation has not yet begun.',
      'The HNWI domestic base is unusually deep relative to city size, driven by Norwegian sovereign wealth distributions and resource-economy family wealth. This insulates pricing from the inbound tourism cycle and supports year-round occupancy at premium rates.',
      'Strategic recommendation: prioritise two Aker Brygge operators currently in informal succession dialogue. The acquisition window is narrowing as Scandinavian PE has begun circling the same inventory in Q1 2026.'
    ],
    PREMIUM_SAUNAS: [
      'Oslo is the operational heart of premium sauna deployment for Oceanvs. Sauna culture is deeply embedded but commercially under-institutionalised — most operators are founder-led with limited capital structure, which creates a clean acquisition runway.',
      'Sunn and KOK are the two incumbent premium operators, both floating-format in the Oslofjord. Floating sauna has emerged as the dominant premium concept for its waterfront integration and low capex profile, and both operators have demonstrated repeatable unit economics across multiple locations.',
      'Booking velocity peaks November through March, with consistent 80%+ utilisation in the winter months at session ADRs that have risen 18% year-over-year. Summer demand has been the historical weakness but is increasingly being filled by inbound wellness tourism.',
      'Strategic recommendation: a two-operator consolidation play in Oslofjord delivers immediate scale, brand authority, and a defensible operational moat against late-entry competitors.'
    ]
  },
  helsinki: {
    COASTAL_HOTELS: [
      'Helsinki offers a coastal hotel proposition that does not exist anywhere else in Europe at this scale: genuine archipelago access within 30 minutes of a capital-city CBD. The island-hotel format is commercially under-exploited and represents a category-defining opportunity for Oceanvs.',
      'Foreign investor interest in Finnish coastal real estate has accelerated since 2023, driven primarily by German and Dutch family offices seeking climate-resilient European exposure. This is reshaping the seller landscape and compressing acquisition timelines.',
      'The Helsinki-Tallinn corridor functions as a continuous demand engine, with weekend leisure traffic from both directions sustaining shoulder-season occupancy at levels that single-city markets cannot match.',
      'Strategic recommendation: secure one anchor archipelago asset within the next 12 months before the international capital base fully prices in the island-hotel thesis.'
    ],
    PREMIUM_SAUNAS: [
      'Helsinki is the global capital of sauna culture, which paradoxically makes premium positioning harder rather than easier. The category is so saturated at the cultural and mass-market level that differentiation cannot rest on concept novelty — it must be earned through luxury execution, design language, and curation.',
      'Löyly remains the benchmark operator and effectively defines the premium ceiling in the city. Any Oceanvs deployment must position cleanly above or distinctly adjacent to Löyly to justify pricing.',
      'The opportunity sits in the second tier of operators: design-led, founder-built, sub-scale businesses that have brand integrity but lack growth capital. Roll-up economics are favourable.',
      'Strategic recommendation: acquire two to three sub-Löyly operators and consolidate under a unified premium positioning that deepens curation rather than competing on saturation.'
    ]
  },
  copenhagen: {
    COASTAL_HOTELS: [
      'Copenhagen is the strongest European short-break destination in the portfolio and combines high-quality harbour culture with disciplined urban planning that supports waterfront hospitality. Islands Brygge and the broader harbour district are the focal corridor.',
      'Wellness tourism has become a structural component of Copenhagen inbound demand, not a seasonal overlay. The city\'s harbour bath culture has normalised water-adjacent wellness as part of the visitor experience, which materially improves coastal hotel economics.',
      'Operator fragmentation is moderate — slightly less attractive than Oslo or Helsinki — but the brand sophistication of existing operators is meaningfully higher. Acquisitions here come at a premium but with reduced operational lift.',
      'Strategic recommendation: Copenhagen is best deployed as the second or third Active Rollup city rather than the first, after a Nordic operating spine has been established in Oslo.'
    ],
    PREMIUM_SAUNAS: [
      'Copenhagen has a nascent premium sauna scene relative to Oslo, Helsinki, and Stockholm. The first-mover window is genuinely open but closing — three credible new entrants have launched in the past 18 months and the category is moving from emergent to established.',
      'Kastrup and Nordhavn are the two likely deployment zones, both with strong waterfront access, transit connectivity, and demographic alignment. Kastrup leans more international, Nordhavn more domestic-affluent.',
      'The Danish wellness consumer is design-literate and price-tolerant. Premium positioning is more easily defended here than in Helsinki because the cultural baseline is lower.',
      'Strategic recommendation: a single flagship deployment in Nordhavn with a second satellite in Kastrup creates category leadership before the window closes by 2027.'
    ]
  },
  stockholm: {
    COASTAL_HOTELS: [
      'Stockholm offers archipelago premium economics comparable to Helsinki but with a more developed luxury hospitality baseline. Djurgården and Nacka Strand are the two focal acquisition zones, each with distinct character and demand profiles.',
      'The Swedish regulatory environment for hospitality acquisition is slightly more complex than Norway — particularly around foreign ownership disclosure and seasonal labour structures — but is well-mapped and not a blocking constraint.',
      'Operator quality in Stockholm is high but margin discipline is variable. Several attractive targets have strong brand equity but undermanaged cost structures, which presents a clear value-creation thesis post-acquisition.',
      'Strategic recommendation: Stockholm is the best fit for a value-add thesis rather than a pure roll-up. Target one or two operators where operational improvement can deliver 200-300 bps of EBITDA margin expansion.'
    ],
    PREMIUM_SAUNAS: [
      'Stockholm has a growing sauna culture with strong crossover into the design and lifestyle aesthetic that defines the city\'s premium consumer. The Fotografiska crowd — design-led, internationally fluent, wellness-engaged — is the natural target demographic.',
      'Unlike Helsinki, the Stockholm sauna market is not culturally saturated. Premium positioning has clear runway, and several emerging operators are already executing well at the design and curation level.',
      'Coastal access in central Stockholm is constrained, which means deployment economics favour the inner archipelago over the urban core. This shifts the operating model toward destination experiences rather than urban convenience.',
      'Strategic recommendation: a destination-format deployment in the inner archipelago with a strong design-led brand creates category leadership in a market that has not yet been claimed.'
    ]
  },
  malta: {
    COASTAL_HOTELS: [
      'Malta is an Investor-Led deployment defined by Grand Harbour adjacency and the exceptional visual asset of Valletta\'s fortress architecture. The brand opportunity here is to deploy Oceanvs as the operating layer on top of an investor-led real estate transaction, not to acquire an operating business.',
      'Flight time from London, Milan, and Frankfurt is under three hours, which positions Malta as a year-round HNWI short-break destination rather than a seasonal beach market. This is the structural difference from competing Mediterranean inventory.',
      'CGI residency and tax structuring continues to drive HNWI inflow, which sustains a luxury hospitality demand floor that Maltese inventory has not fully captured. Existing supply skews mid-market and corporate.',
      'Strategic recommendation: pursue a Valletta-adjacent fortress conversion as the brand anchor, with the anchor investor leading on land and capital and Oceanvs deploying brand and operations against a 36-month build-out.'
    ],
    PREMIUM_SAUNAS: [
      'Malta\'s wellness scene is nascent, which makes the deployment thesis less about category competition and more about category creation. Traditional Nordic sauna positioning will not translate cleanly given the climate, so the framing must shift to year-round premium wellness.',
      'Thermal seawater and hammam crossover are the strategic levers. Malta\'s proximity to North African and Middle Eastern wellness traditions creates a credible cultural foundation for a hammam-thermal-sauna hybrid that does not exist in the European premium market.',
      'The HNWI demand profile is well-suited to membership and curated-access models. Day-rate transactional volume will be limited; recurring relationships drive the unit economics.',
      'Strategic recommendation: deploy as a wellness layer integrated into the coastal hotel anchor rather than as a standalone asset. Standalone premium sauna in Malta is uneconomic at current land prices.'
    ]
  },
  greece: {
    COASTAL_HOTELS: [
      'Porto Heli is the highest-quality Investor-Led opportunity in the portfolio. The Aman Amanzoe operates as both a comparable and a demand validator — its sustained occupancy and rate performance over a decade has proven the willingness-to-pay at this specific micro-market.',
      'The Greek Golden Visa programme continues to drive HNWI real estate activity in the region, with the Porto Heli marina community now functioning as a permanent rather than seasonal HNWI footprint. This materially changes the year-round demand profile.',
      'Henrik\'s relationship is the live investor context for this deployment. Asset selection, capital structure, and brand positioning are all moving in parallel rather than sequentially, which compresses the deployment timeline relative to a standard Investor-Led model.',
      'Strategic recommendation: this is the deployment most likely to set the international brand ceiling for Oceanvs. Execution quality matters disproportionately because the comparables are global, not regional.'
    ],
    PREMIUM_SAUNAS: [
      'Porto Heli\'s premium sauna opportunity is best understood as a hammam-thermal hybrid rather than a Nordic sauna deployment. The cultural lineage of Mediterranean and Aegean bathing supports this framing more authentically than imported Nordic format would.',
      'Demand peaks June through September with the marina-driven HNWI cohort, but the year-round resident community provides a meaningful baseline that distinguishes Porto Heli from most Greek coastal inventory.',
      'The asset should be co-located with the coastal hotel deployment rather than standalone. Combined wellness and hospitality programming is the operating thesis, with the sauna and thermal experience functioning as a brand differentiator and a margin contributor.',
      'Strategic recommendation: integrated wellness within the hotel deployment, sized to support member-style recurring access from the marina community as the off-peak revenue floor.'
    ]
  },
  osaka: {
    COASTAL_HOTELS: [
      'Osaka represents the most operationally distinctive Investor-Led opportunity. Osaka Bay waterfront regeneration, accelerated by the Expo 2025 legacy infrastructure, has created developable inventory of a quality and scale that does not exist elsewhere in the Oceanvs geography.',
      'Inbound luxury tourism to Japan has rebuilt rapidly post-COVID and is now structurally above 2019 levels, with Osaka capturing a larger share than the city has historically claimed. Tokyo-Kyoto-Osaka triangulation now favours Osaka for second-night stays in a way it did not pre-pandemic.',
      'Nakanoshima Island is the focal zone for a coastal-adjacent deployment with cultural integration. The waterfront here functions as a curated district rather than commodity coastline, which supports premium positioning and rate.',
      'Strategic recommendation: pursue a Nakanoshima-anchored deployment with strong local operating partnership. Japanese hospitality acquisition without local operating depth carries asymmetric execution risk.'
    ],
    PREMIUM_SAUNAS: [
      'Osaka\'s sento and onsen traditions create the most receptive consumer base for premium bathing in the entire portfolio. The strategic frame is luxury repositioning of indigenous bathing culture, not introduction of a foreign concept.',
      'Dotonbori and Namba HNWI F&B activity is the closest demand proxy. The same consumer cohort that supports the city\'s premium dining and members-club scene is the natural target for a curated bathing destination.',
      'Existing onsen and sento operators are not natural acquisition targets — the cultural and operational gap is too wide. Deployment is greenfield, branded, and built on top of investor-led real estate.',
      'Strategic recommendation: a single flagship deployment with a secondary satellite, both anchored to Nakanoshima or the central HNWI corridor, with brand positioning that bridges Japanese tradition and international luxury.'
    ]
  }
}
