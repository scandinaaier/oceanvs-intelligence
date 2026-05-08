import type { BrandDeployment, CityKey, Vertical } from '../../types'

export const BRAND_DEPLOYMENT: Partial<Record<CityKey, Record<Vertical, BrandDeployment>>> = {
  malta: {
    COASTAL_HOTELS: {
      asset: {
        title: 'Valletta Fortress Conversion',
        description: 'Pre-war fortification building adjacent to Grand Harbour, c. 4,200 sqm GFA, 38-key conversion potential with rooftop and harbour-facing dining levels.',
        ownership: 'Investor-led acquisition, off-market dialogue with private vendor',
        coastalAccess: 'Direct Grand Harbour frontage, protected heritage views, sea-level water access via adjacent quay',
        scale: 'Estimated total project capex €34M-€41M including conversion, FF&E, and brand integration'
      },
      investor: {
        status: 'In Dialogue',
        profile: 'European single-family office, c. €2B AUM, mandate for hospitality real estate with operating partner',
        dependencies: 'Heritage permitting timeline, harbour zoning confirmation, Oceanvs operating agreement structure'
      },
      timeline: [
        { phase: 'Investor Alignment', duration: '0-3 months', milestone: 'Term sheet executed, JV structure finalised', current: true },
        { phase: 'Asset Acquisition', duration: '3-9 months', milestone: 'SPA signed, completion of permitting' },
        { phase: 'Design & Approvals', duration: '9-15 months', milestone: 'Heritage approval, construction permits' },
        { phase: 'Construction', duration: '15-30 months', milestone: 'Building handover, FF&E installation' },
        { phase: 'Brand Deployment', duration: '30-36 months', milestone: 'Soft opening, first 90 days of operation' }
      ]
    },
    PREMIUM_SAUNAS: {
      asset: {
        title: 'Integrated Wellness Layer',
        description: 'Hammam-thermal-sauna hybrid integrated within the Valletta hotel deployment, c. 850 sqm dedicated wellness floor.',
        ownership: 'Integrated within hotel JV — no standalone asset acquisition',
        coastalAccess: 'Sea-level thermal pool with direct harbour water exchange',
        scale: 'c. €4.5M wellness fit-out within broader hotel capex envelope'
      },
      investor: {
        status: 'In Dialogue',
        profile: 'Same JV structure as hotel deployment',
        dependencies: 'Hotel asset acquisition timing, wellness operating partner selection'
      },
      timeline: [
        { phase: 'Concept Definition', duration: '0-4 months', milestone: 'Wellness programming finalised', current: true },
        { phase: 'Design Integration', duration: '4-12 months', milestone: 'Wellness design integrated into base building' },
        { phase: 'Build', duration: '12-28 months', milestone: 'Wellness fit-out complete' },
        { phase: 'Launch', duration: '28-36 months', milestone: 'Member programme launch alongside hotel opening' }
      ]
    }
  },
  greece: {
    COASTAL_HOTELS: {
      asset: {
        title: 'Porto Heli Coastal Estate',
        description: 'c. 14-hectare seafront parcel with 600m of private coastline, planning consent under negotiation for 32-key resort with private villa component.',
        ownership: 'Anchor investor (Henrik) leading land acquisition; Oceanvs as operating partner',
        coastalAccess: 'Private cove, deep-water marina access, direct neighbour to Aman Amanzoe corridor',
        scale: 'Estimated total project capex €72M-€85M, blended hotel + villa structure'
      },
      investor: {
        status: 'Term Sheet',
        profile: 'Active Oceanvs investor relationship, multi-jurisdictional family office, hospitality and superyacht exposure',
        dependencies: 'Greek planning process, environmental approvals, marina connection rights'
      },
      timeline: [
        { phase: 'Land Closing', duration: '0-4 months', milestone: 'Title transfer, JV operational agreement', current: true },
        { phase: 'Master Planning', duration: '4-10 months', milestone: 'Planning consent secured' },
        { phase: 'Design Development', duration: '10-18 months', milestone: 'IFC drawings, contractor selection' },
        { phase: 'Construction', duration: '18-36 months', milestone: 'Topping out, FF&E procurement' },
        { phase: 'Brand Launch', duration: '36-42 months', milestone: 'Soft opening, marina activation' }
      ]
    },
    PREMIUM_SAUNAS: {
      asset: {
        title: 'Integrated Wellness Pavilion',
        description: 'Hammam-Aegean thermal pavilion integrated within the Porto Heli coastal resort, c. 1,200 sqm with dedicated marina-side access.',
        ownership: 'Integrated within Porto Heli JV',
        coastalAccess: 'Direct seafront with thermal saltwater pool',
        scale: 'c. €7M dedicated wellness capex within resort envelope'
      },
      investor: {
        status: 'Term Sheet',
        profile: 'Same anchor JV as hotel asset',
        dependencies: 'Resort masterplan integration, wellness operating leadership'
      },
      timeline: [
        { phase: 'Programming', duration: '0-6 months', milestone: 'Wellness concept locked', current: true },
        { phase: 'Design Integration', duration: '6-14 months', milestone: 'Pavilion design within masterplan' },
        { phase: 'Build', duration: '14-34 months', milestone: 'Pavilion handover' },
        { phase: 'Launch', duration: '34-42 months', milestone: 'Member access activated with resort opening' }
      ]
    }
  },
  osaka: {
    COASTAL_HOTELS: {
      asset: {
        title: 'Nakanoshima Waterfront Build',
        description: 'New-build coastal-adjacent hotel on Nakanoshima Island, c. 5,800 sqm site, 56-key luxury format with cultural programming integration.',
        ownership: 'Anchor investor lead with Japanese operating partner; Oceanvs as brand operator',
        coastalAccess: 'Nakanoshima riverfront, protected waterfront promenade, walking distance to Osaka Bay',
        scale: 'Estimated capex ¥9.4B-¥11.2B (c. €58M-€69M)'
      },
      investor: {
        status: 'Identified',
        profile: 'Asia-Pacific institutional capital with hospitality mandate, partnered with Japanese operating company',
        dependencies: 'Japanese operating partner selection, regulatory licensing, Expo 2025 site access timing'
      },
      timeline: [
        { phase: 'Partner Selection', duration: '0-5 months', milestone: 'JV with Japanese operator finalised', current: true },
        { phase: 'Site Acquisition', duration: '5-12 months', milestone: 'Site secured, design brief locked' },
        { phase: 'Design & Permitting', duration: '12-22 months', milestone: 'Building permit issued' },
        { phase: 'Construction', duration: '22-42 months', milestone: 'Building completion' },
        { phase: 'Brand Launch', duration: '42-48 months', milestone: 'Opening, integrated cultural programming live' }
      ]
    },
    PREMIUM_SAUNAS: {
      asset: {
        title: 'Nakanoshima Bathing Flagship',
        description: 'Greenfield premium bathing destination, c. 1,800 sqm, sento-onsen-sauna fusion programming, integrated with hotel or standalone.',
        ownership: 'JV with anchor investor, operating partner sourced from Japanese hospitality',
        coastalAccess: 'Riverfront access with thermal pool integration',
        scale: 'c. ¥1.8B-¥2.4B (c. €11M-€15M) standalone, or integrated within hotel capex'
      },
      investor: {
        status: 'Identified',
        profile: 'Aligned with hotel JV structure',
        dependencies: 'Cultural advisory board, operating licensing, brand positioning approval'
      },
      timeline: [
        { phase: 'Concept', duration: '0-6 months', milestone: 'Programming and brand position finalised', current: true },
        { phase: 'Site & Design', duration: '6-18 months', milestone: 'Site secured, design complete' },
        { phase: 'Build', duration: '18-36 months', milestone: 'Construction complete' },
        { phase: 'Launch', duration: '36-42 months', milestone: 'Public opening with member tier active' }
      ]
    }
  }
}
