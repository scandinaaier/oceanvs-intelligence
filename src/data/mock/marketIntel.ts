import type { CityKey, CapitalEvent, TrendCard } from '../../types'

export const CAPITAL_EVENTS: Record<CityKey, CapitalEvent[]> = {
  oslo: [
    { id: 'cf-osl-1', date: '2026-04-22', investor: 'Verdane Capital', target: 'Nordic Wellness Group', dealEur: 84000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-osl-2', date: '2026-04-08', investor: 'Norvestor', target: 'Aker Brygge Hospitality', dealEur: 42000000, subsector: 'Boutique Hotel' },
    { id: 'cf-osl-3', date: '2026-03-29', investor: 'EQT Real Estate', target: 'Oslofjord Properties', dealEur: 156000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-osl-4', date: '2026-03-15', investor: 'FSN Capital', target: 'Sunn Group (minority)', dealEur: 18000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-osl-5', date: '2026-03-04', investor: 'Altor', target: 'Bygdøy Hotel Co.', dealEur: 28000000, subsector: 'Boutique Hotel' },
    { id: 'cf-osl-6', date: '2026-02-21', investor: 'HitecVision', target: 'Coastal Longevity Clinic', dealEur: 22000000, subsector: 'Longevity' },
    { id: 'cf-osl-7', date: '2026-02-09', investor: 'Storebrand', target: 'Frognerkilen Resort', dealEur: 36000000, subsector: 'Boutique Hotel' },
    { id: 'cf-osl-8', date: '2026-01-28', investor: 'Reiten & Co', target: 'Nordic F&B Wellness', dealEur: 14000000, subsector: 'F&B Wellness' }
  ],
  helsinki: [
    { id: 'cf-hel-1', date: '2026-04-19', investor: 'CapMan', target: 'Allas Sea Pool (minority)', dealEur: 24000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-hel-2', date: '2026-04-04', investor: 'Sponsor Capital', target: 'Suomenlinna Hospitality', dealEur: 38000000, subsector: 'Boutique Hotel' },
    { id: 'cf-hel-3', date: '2026-03-25', investor: 'Intera Partners', target: 'Helsinki Wellness Holdings', dealEur: 67000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-hel-4', date: '2026-03-11', investor: 'Vaaka Partners', target: 'Lauttasaari Sauna Co.', dealEur: 12000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-hel-5', date: '2026-02-28', investor: 'MB Funds', target: 'Saaristo Group', dealEur: 31000000, subsector: 'Boutique Hotel' },
    { id: 'cf-hel-6', date: '2026-02-14', investor: 'Korkia Capital', target: 'Nordic Longevity Lab', dealEur: 9500000, subsector: 'Longevity' },
    { id: 'cf-hel-7', date: '2026-01-31', investor: 'Tesi', target: 'Coastal F&B Concept', dealEur: 6500000, subsector: 'F&B Wellness' },
    { id: 'cf-hel-8', date: '2026-01-19', investor: 'eQ Asset Management', target: 'Archipelago Properties', dealEur: 88000000, subsector: 'Wellness Real Estate' }
  ],
  copenhagen: [
    { id: 'cf-cph-1', date: '2026-04-25', investor: 'Polaris Equity', target: 'Islands Brygge Group', dealEur: 52000000, subsector: 'Boutique Hotel' },
    { id: 'cf-cph-2', date: '2026-04-11', investor: 'Axcel', target: 'CPH Wellness Collective', dealEur: 36000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-cph-3', date: '2026-03-30', investor: 'Maj Invest Equity', target: 'Nordhavn Quarter Hotel', dealEur: 44000000, subsector: 'Boutique Hotel' },
    { id: 'cf-cph-4', date: '2026-03-17', investor: 'Kirk Kapital', target: 'Refshaleøen Bath Co.', dealEur: 11000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-cph-5', date: '2026-03-02', investor: 'CataCap', target: 'Holmen Hospitality', dealEur: 26000000, subsector: 'Boutique Hotel' },
    { id: 'cf-cph-6', date: '2026-02-19', investor: 'Capidea', target: 'Copenhagen Longevity', dealEur: 8500000, subsector: 'Longevity' },
    { id: 'cf-cph-7', date: '2026-02-05', investor: 'Erhvervsinvest', target: 'CPH F&B Collective', dealEur: 15000000, subsector: 'F&B Wellness' },
    { id: 'cf-cph-8', date: '2026-01-22', investor: 'NREP', target: 'Harbour District Assets', dealEur: 124000000, subsector: 'Wellness Real Estate' }
  ],
  stockholm: [
    { id: 'cf-sto-1', date: '2026-04-30', investor: 'EQT Mid Market', target: 'Djurgården Hospitality', dealEur: 68000000, subsector: 'Boutique Hotel' },
    { id: 'cf-sto-2', date: '2026-04-13', investor: 'Adelis Equity', target: 'Stockholm Bath Group', dealEur: 28000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-sto-3', date: '2026-03-28', investor: 'Nordic Capital', target: 'Skärgården Properties', dealEur: 142000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-sto-4', date: '2026-03-14', investor: 'Litorina', target: 'Centralbadet (minority)', dealEur: 19000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-sto-5', date: '2026-03-01', investor: 'Triton', target: 'Nacka Strand Resort', dealEur: 56000000, subsector: 'Boutique Hotel' },
    { id: 'cf-sto-6', date: '2026-02-16', investor: 'Priveq', target: 'Swedish Longevity Co.', dealEur: 14000000, subsector: 'Longevity' },
    { id: 'cf-sto-7', date: '2026-02-04', investor: 'FSN Capital', target: 'Stockholm Wellness F&B', dealEur: 22000000, subsector: 'F&B Wellness' },
    { id: 'cf-sto-8', date: '2026-01-21', investor: 'Altor', target: 'Vaxholm Coastal Group', dealEur: 31000000, subsector: 'Boutique Hotel' }
  ],
  malta: [
    { id: 'cf-mal-1', date: '2026-04-26', investor: 'Mid-Europa Partners', target: 'Valletta Heritage Group', dealEur: 78000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-mal-2', date: '2026-04-09', investor: 'BlueGem Capital', target: 'Mediterranean Wellness Co.', dealEur: 32000000, subsector: 'Boutique Hotel' },
    { id: 'cf-mal-3', date: '2026-03-26', investor: 'Hayfin Capital', target: 'Maltese Coastal Assets', dealEur: 96000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-mal-4', date: '2026-03-12', investor: 'EOS Private Equity', target: 'Sliema Hospitality', dealEur: 24000000, subsector: 'Boutique Hotel' },
    { id: 'cf-mal-5', date: '2026-02-27', investor: 'Tikehau Capital', target: 'Malta Thermal Group', dealEur: 18000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-mal-6', date: '2026-02-13', investor: 'PAI Partners', target: 'Med Longevity Clinics', dealEur: 41000000, subsector: 'Longevity' },
    { id: 'cf-mal-7', date: '2026-01-30', investor: 'Eurazeo', target: 'Valletta F&B Collective', dealEur: 12500000, subsector: 'F&B Wellness' },
    { id: 'cf-mal-8', date: '2026-01-17', investor: 'Pemberton Asset Mgmt', target: 'Grand Harbour Properties', dealEur: 67000000, subsector: 'Wellness Real Estate' }
  ],
  greece: [
    { id: 'cf-gre-1', date: '2026-04-28', investor: 'Henderson Park', target: 'Peloponnese Resorts', dealEur: 184000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-gre-2', date: '2026-04-15', investor: 'Brookfield', target: 'Aegean Coastal Holdings', dealEur: 245000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-gre-3', date: '2026-03-31', investor: 'Hines', target: 'Porto Heli Marina Co.', dealEur: 58000000, subsector: 'Boutique Hotel' },
    { id: 'cf-gre-4', date: '2026-03-19', investor: 'Aermont Capital', target: 'Greek Wellness Group', dealEur: 41000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-gre-5', date: '2026-03-05', investor: 'Round Hill Capital', target: 'Argolida Estates', dealEur: 92000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-gre-6', date: '2026-02-22', investor: 'Sixth Street', target: 'Hellenic Longevity', dealEur: 36000000, subsector: 'Longevity' },
    { id: 'cf-gre-7', date: '2026-02-08', investor: 'Apollo Hybrid Value', target: 'Aegean F&B Wellness', dealEur: 18000000, subsector: 'F&B Wellness' },
    { id: 'cf-gre-8', date: '2026-01-25', investor: 'Blackstone Real Estate', target: 'Argolic Coastal Estate', dealEur: 312000000, subsector: 'Wellness Real Estate' }
  ],
  osaka: [
    { id: 'cf-osa-1', date: '2026-04-29', investor: 'KKR Asia', target: 'Nakanoshima Properties', dealEur: 198000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-osa-2', date: '2026-04-12', investor: 'PAG', target: 'Osaka Bay Hospitality', dealEur: 86000000, subsector: 'Boutique Hotel' },
    { id: 'cf-osa-3', date: '2026-03-27', investor: 'Bain Capital Asia', target: 'Kansai Wellness Group', dealEur: 124000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-osa-4', date: '2026-03-13', investor: 'Gaw Capital', target: 'Dotonbori Hospitality', dealEur: 54000000, subsector: 'Boutique Hotel' },
    { id: 'cf-osa-5', date: '2026-02-26', investor: 'CapitaLand', target: 'Osaka Bayfront Holdings', dealEur: 167000000, subsector: 'Wellness Real Estate' },
    { id: 'cf-osa-6', date: '2026-02-11', investor: 'Carlyle Asia', target: 'Japan Longevity Network', dealEur: 78000000, subsector: 'Longevity' },
    { id: 'cf-osa-7', date: '2026-01-29', investor: 'Hillhouse', target: 'Premium Onsen Group', dealEur: 92000000, subsector: 'Thermal & Sauna' },
    { id: 'cf-osa-8', date: '2026-01-16', investor: 'Mitsubishi Estate', target: 'Namba F&B Wellness', dealEur: 28000000, subsector: 'F&B Wellness' }
  ]
}

export const TRENDS: Record<CityKey, TrendCard[]> = {
  oslo: [
    { id: 't-osl-1', name: 'Floating Sauna Format Standardisation', momentum: 9, vertical: 'PREMIUM_SAUNAS', insight: 'Floating sauna economics have moved from experimental to repeatable, with multi-unit operators now achieving consistent payback within 28 months. Format-led roll-up is now investable.', timeToMainstream: 'Now' },
    { id: 't-osl-2', name: 'Aker Brygge Succession Wave', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Founder-operators of Oslofjord boutique hotels are entering succession decisions concentrated in 2026-2027. Acquisition supply will materially expand within 18 months.', timeToMainstream: '12-18 months' },
    { id: 't-osl-3', name: 'Cold Plunge Ritualisation', momentum: 7, vertical: 'PREMIUM_SAUNAS', insight: 'Programmed contrast therapy (cold plunge + sauna sessions on fixed cadence) has shifted from biohacker fringe to mainstream wellness ritual, lifting session ADR by 22% YoY.', timeToMainstream: 'Now' },
    { id: 't-osl-4', name: 'Coastal Wellness Memberships', momentum: 7, vertical: 'BOTH', insight: 'Recurring annual memberships at €2,400-€3,800 are stabilising the off-peak revenue floor for premium coastal operators. Member churn data is now reliable enough to underwrite.', timeToMainstream: '6-12 months' },
    { id: 't-osl-5', name: 'NOK Weakness Lift to ADR', momentum: 6, vertical: 'COASTAL_HOTELS', insight: 'Sustained NOK weakness against EUR has improved Oslo competitiveness for inbound European HNWI travel without compressing local-currency ADR. Net effect is positive on EUR-denominated rate.', timeToMainstream: 'Now' }
  ],
  helsinki: [
    { id: 't-hel-1', name: 'Island Hotel Concept Maturation', momentum: 9, vertical: 'COASTAL_HOTELS', insight: 'Helsinki archipelago island hotels have moved from one-off curiosities to a defensible category with documented rate premium and stable occupancy. The format is now investable at scale.', timeToMainstream: '12 months' },
    { id: 't-hel-2', name: 'Premium Sauna Stratification', momentum: 8, vertical: 'PREMIUM_SAUNAS', insight: 'The Finnish premium sauna market is bifurcating between Löyly-tier flagships and design-led second-tier operators. The middle is being acquired or closed within 24 months.', timeToMainstream: 'Now' },
    { id: 't-hel-3', name: 'Helsinki-Tallinn Wellness Corridor', momentum: 7, vertical: 'BOTH', insight: 'Cross-Baltic weekend wellness traffic now sustains 31% of off-peak boutique inventory. Booking patterns indicate this is structural rather than cyclical.', timeToMainstream: 'Now' },
    { id: 't-hel-4', name: 'German Family Office Inflow', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'German and Dutch family offices have allocated meaningfully to Finnish coastal real estate since 2023, compressing acquisition windows on archipelago inventory.', timeToMainstream: 'Now' },
    { id: 't-hel-5', name: 'Sento-Sauna Crossover', momentum: 5, vertical: 'PREMIUM_SAUNAS', insight: 'Inbound Asian wellness tourism is reframing Finnish sauna programming around comparable bathing rituals, opening a curated-experience ADR tier 60% above standard premium.', timeToMainstream: '18-24 months' }
  ],
  copenhagen: [
    { id: 't-cph-1', name: 'Harbour Bath Normalisation', momentum: 8, vertical: 'BOTH', insight: 'Copenhagen has fully normalised harbour-water wellness as part of inbound tourism programming, lifting coastal hotel cross-sell economics. Wellness is now table stakes, not a premium add-on.', timeToMainstream: 'Now' },
    { id: 't-cph-2', name: 'Nordhavn Premium Cluster', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Nordhavn has emerged as the credible premium hospitality cluster outside the historic core, with three new boutique projects under contract for 2027 opening.', timeToMainstream: '12-18 months' },
    { id: 't-cph-3', name: 'Premium Sauna First-Mover Window', momentum: 7, vertical: 'PREMIUM_SAUNAS', insight: 'Copenhagen\'s premium sauna scene has three credible new entrants in 18 months. The first-mover advantage window closes by mid-2027.', timeToMainstream: '12 months' },
    { id: 't-cph-4', name: 'Refshaleøen Cultural Anchor', momentum: 6, vertical: 'COASTAL_HOTELS', insight: 'Refshaleøen\'s evolution from industrial fringe to cultural-wellness anchor is now reflected in pricing, with land values up 41% over 24 months.', timeToMainstream: 'Now' },
    { id: 't-cph-5', name: 'Nordic Design Premium Persistence', momentum: 6, vertical: 'BOTH', insight: 'Nordic design language continues to support 18-24% rate premium on hospitality globally. The aesthetic moat is durable into the 2030s.', timeToMainstream: 'Now' }
  ],
  stockholm: [
    { id: 't-sto-1', name: 'Inner Archipelago Premium', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Stockholm inner archipelago inventory commands a 31% rate premium over central urban inventory and shows lower seasonality than expected.', timeToMainstream: 'Now' },
    { id: 't-sto-2', name: 'Design-Led Sauna Emergence', momentum: 7, vertical: 'PREMIUM_SAUNAS', insight: 'A new generation of design-led Stockholm sauna operators is emerging from the Fotografiska/lifestyle ecosystem. Premium positioning has runway because the cultural baseline is lower than Helsinki.', timeToMainstream: '18 months' },
    { id: 't-sto-3', name: 'Margin Discipline Gap', momentum: 7, vertical: 'COASTAL_HOTELS', insight: 'Stockholm hospitality assets show a documented 200-300 bps EBITDA margin gap to comparable Oslo and Copenhagen inventory. Operational improvement is the value-creation thesis.', timeToMainstream: 'Now' },
    { id: 't-sto-4', name: 'Djurgården Heritage Premium', momentum: 6, vertical: 'COASTAL_HOTELS', insight: 'Djurgården heritage inventory is increasingly priced as a cultural asset rather than a hospitality asset, lifting both acquisition cost and defensible rate.', timeToMainstream: 'Now' },
    { id: 't-sto-5', name: 'Wellness-F&B Integration', momentum: 5, vertical: 'BOTH', insight: 'Integrated wellness-F&B programming (cold-pressed bars, fermented kitchens) is now a documented revenue driver in Swedish premium hospitality, contributing 8-12% to top line.', timeToMainstream: '12 months' }
  ],
  malta: [
    { id: 't-mal-1', name: 'CGI HNWI Inflow Sustained', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'CGI residency continues to drive measurable HNWI footfall growth at 14% YoY despite EU pressure. The base case remains structural through 2028.', timeToMainstream: 'Now' },
    { id: 't-mal-2', name: 'Hammam-Thermal Hybrid Format', momentum: 7, vertical: 'PREMIUM_SAUNAS', insight: 'A Mediterranean hammam-thermal hybrid format is the only premium bathing model that translates climatically to Malta. Pioneer operators are setting category economics now.', timeToMainstream: '24 months' },
    { id: 't-mal-3', name: 'Valletta Heritage Conversion Wave', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Heritage building conversions in Valletta are accelerating, with a documented 39% lift in EUR rate premium for fortress-adjacent hospitality over generic Sliema inventory.', timeToMainstream: 'Now' },
    { id: 't-mal-4', name: 'Year-Round Demand Smoothing', momentum: 7, vertical: 'BOTH', insight: 'Sub-3-hour flight reach to Malta is materially smoothing seasonality, with shoulder-season occupancy now 22 points higher than the broader Mediterranean average.', timeToMainstream: 'Now' },
    { id: 't-mal-5', name: 'Membership Models for HNWI Retention', momentum: 6, vertical: 'BOTH', insight: 'Membership-based access models are emerging as the structural answer to Malta\'s thin transactional luxury market, supporting recurring revenue economics.', timeToMainstream: '18 months' }
  ],
  greece: [
    { id: 't-gre-1', name: 'Aman Comparable Validation', momentum: 9, vertical: 'COASTAL_HOTELS', insight: 'A decade of Aman Amanzoe operating data has validated Porto Heli rate and occupancy economics at the global luxury ceiling. The willingness-to-pay is proven.', timeToMainstream: 'Now' },
    { id: 't-gre-2', name: 'Marina Year-Round HNWI Footprint', momentum: 8, vertical: 'BOTH', insight: 'The Porto Heli marina community has shifted from seasonal to permanent HNWI footprint, materially changing year-round demand and supporting member-style models.', timeToMainstream: 'Now' },
    { id: 't-gre-3', name: 'Golden Visa Real Estate Velocity', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Greek Golden Visa-driven HNWI real estate purchases continue at 18% YoY despite price floor changes. The Argolida coast captures disproportionate share.', timeToMainstream: 'Now' },
    { id: 't-gre-4', name: 'Aegean Thermal Heritage Reframing', momentum: 6, vertical: 'PREMIUM_SAUNAS', insight: 'Aegean thermal bathing heritage provides authentic cultural foundation for premium wellness positioning, more credible than imported Nordic format would be.', timeToMainstream: '24 months' },
    { id: 't-gre-5', name: 'Superyacht Wellness Tendering', momentum: 7, vertical: 'BOTH', insight: 'Superyacht clients increasingly tender shoreside wellness as part of the curated cruise experience, creating a high-margin B2B layer above standard hospitality demand.', timeToMainstream: '12 months' }
  ],
  osaka: [
    { id: 't-osa-1', name: 'Inbound Luxury Recovery Above 2019', momentum: 9, vertical: 'COASTAL_HOTELS', insight: 'Inbound luxury tourism to Japan is now structurally above 2019 levels, with Osaka capturing materially higher share than pre-pandemic. The shift appears durable.', timeToMainstream: 'Now' },
    { id: 't-osa-2', name: 'Expo 2025 Legacy Activation', momentum: 8, vertical: 'COASTAL_HOTELS', insight: 'Expo 2025 has accelerated Osaka Bay regeneration by 7-10 years. Legacy infrastructure now supports waterfront premium hospitality at a quality previously unavailable.', timeToMainstream: 'Now' },
    { id: 't-osa-3', name: 'Sento Cultural Repositioning', momentum: 7, vertical: 'PREMIUM_SAUNAS', insight: 'Premium repositioning of indigenous bathing culture is the emerging strategic frame, with two Tokyo flagships now demonstrating the unit economics translate to luxury pricing.', timeToMainstream: '18 months' },
    { id: 't-osa-4', name: 'Tokyo-Kyoto-Osaka Triangulation Shift', momentum: 7, vertical: 'COASTAL_HOTELS', insight: 'Luxury second-night stays are increasingly favouring Osaka over Kyoto, supported by improved waterfront product. Demand pattern is restructuring durably.', timeToMainstream: 'Now' },
    { id: 't-osa-5', name: 'Nakanoshima Curated District', momentum: 6, vertical: 'BOTH', insight: 'Nakanoshima Island is consolidating as a curated premium district anchored by cultural institutions, supporting hospitality positioning that would not work in Dotonbori or Namba.', timeToMainstream: '12-18 months' }
  ]
}
