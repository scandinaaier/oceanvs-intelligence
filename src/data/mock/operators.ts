import type { Operator, CityKey, Vertical } from '../../types'

type OperatorMap = Record<CityKey, Record<Vertical, Operator[]>>

export const OPERATORS: OperatorMap = {
  oslo: {
    COASTAL_HOTELS: [
      { id: 'osl-c-1', name: 'Hotel Brygge', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 28, unitLabel: 'keys', estRevenueEur: 4900000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 18000000, askingPriceMax: 22000000, estEbitda: 2100000 },
      { id: 'osl-c-2', name: 'Bygdøy Coast House', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 22, unitLabel: 'keys', estRevenueEur: 3700000, lmiFit: 8, acquisitionReadiness: 4, status: 'Active Interest', askingPriceMin: 14500000, askingPriceMax: 17000000, estEbitda: 1450000 },
      { id: 'osl-c-3', name: 'Aker Brygge Maritim', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 36, unitLabel: 'keys', estRevenueEur: 5800000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 21000000, askingPriceMax: 26000000, estEbitda: 2300000 },
      { id: 'osl-c-4', name: 'Sjøsiden Boutique', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 18, unitLabel: 'keys', estRevenueEur: 2900000, lmiFit: 7, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 11000000, askingPriceMax: 13500000, estEbitda: 1150000 },
      { id: 'osl-c-5', name: 'Tjuvholmen Suites', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 24, unitLabel: 'keys', estRevenueEur: 4200000, lmiFit: 9, acquisitionReadiness: 2, status: 'Monitoring', askingPriceMin: 16000000, askingPriceMax: 19000000, estEbitda: 1700000 },
      { id: 'osl-c-6', name: 'Frognerkilen Lodge', city: 'oslo', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 16, unitLabel: 'keys', estRevenueEur: 2400000, lmiFit: 7, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 9500000, askingPriceMax: 11500000, estEbitda: 950000 }
    ],
    PREMIUM_SAUNAS: [
      { id: 'osl-s-1', name: 'KOK Oslo', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 240, unitLabel: 'sessions/day', estRevenueEur: 3800000, lmiFit: 10, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 11000000, askingPriceMax: 14000000, estEbitda: 1400000 },
      { id: 'osl-s-2', name: 'Sunn Fjordbad', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 195, unitLabel: 'sessions/day', estRevenueEur: 3100000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 9500000, askingPriceMax: 11500000, estEbitda: 1100000 },
      { id: 'osl-s-3', name: 'Bygdøy Bath Co.', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 140, unitLabel: 'sessions/day', estRevenueEur: 1900000, lmiFit: 8, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 5800000, askingPriceMax: 7200000, estEbitda: 720000 },
      { id: 'osl-s-4', name: 'Aker Sauna Society', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 165, unitLabel: 'sessions/day', estRevenueEur: 2300000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 7000000, askingPriceMax: 8800000, estEbitda: 850000 },
      { id: 'osl-s-5', name: 'Oslo Badstu Group', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 3, keysOrSessions: 480, unitLabel: 'sessions/day', estRevenueEur: 5600000, lmiFit: 6, acquisitionReadiness: 4, status: 'Monitoring', scaleOpportunity: true, askingPriceMin: 14000000, askingPriceMax: 17000000, estEbitda: 1700000 },
      { id: 'osl-s-6', name: 'Frognerbadet', city: 'oslo', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 110, unitLabel: 'sessions/day', estRevenueEur: 1500000, lmiFit: 7, acquisitionReadiness: 2, status: 'Monitoring', askingPriceMin: 4500000, askingPriceMax: 5800000, estEbitda: 540000 }
    ]
  },
  helsinki: {
    COASTAL_HOTELS: [
      { id: 'hel-c-1', name: 'Saaristo Island Hotel', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 24, unitLabel: 'keys', estRevenueEur: 3600000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 14000000, askingPriceMax: 17000000, estEbitda: 1450000 },
      { id: 'hel-c-2', name: 'Suomenlinna Maritime', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 18, unitLabel: 'keys', estRevenueEur: 2700000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 10500000, askingPriceMax: 12500000, estEbitda: 1080000 },
      { id: 'hel-c-3', name: 'Kallahti Coastal', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 32, unitLabel: 'keys', estRevenueEur: 4100000, lmiFit: 7, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 14000000, askingPriceMax: 17000000, estEbitda: 1500000 },
      { id: 'hel-c-4', name: 'Lauttasaari House', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 20, unitLabel: 'keys', estRevenueEur: 2400000, lmiFit: 7, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 8500000, askingPriceMax: 10500000, estEbitda: 880000 },
      { id: 'hel-c-5', name: 'Vuosaari Bay Lodge', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 26, unitLabel: 'keys', estRevenueEur: 3000000, lmiFit: 7, acquisitionReadiness: 2, status: 'Monitoring', askingPriceMin: 11000000, askingPriceMax: 13000000, estEbitda: 1100000 },
      { id: 'hel-c-6', name: 'Tähtitorninvuori Inn', city: 'helsinki', vertical: 'COASTAL_HOTELS', coastalRating: 3, keysOrSessions: 14, unitLabel: 'keys', estRevenueEur: 1700000, lmiFit: 6, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 6000000, askingPriceMax: 7500000, estEbitda: 620000 }
    ],
    PREMIUM_SAUNAS: [
      { id: 'hel-s-1', name: 'Allas Sea Pool', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 320, unitLabel: 'sessions/day', estRevenueEur: 4800000, lmiFit: 9, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 14000000, askingPriceMax: 17500000, estEbitda: 1750000 },
      { id: 'hel-s-2', name: 'Kulttuurisauna', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 145, unitLabel: 'sessions/day', estRevenueEur: 1900000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 6000000, askingPriceMax: 7500000, estEbitda: 720000 },
      { id: 'hel-s-3', name: 'Sompasauna Premium', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 210, unitLabel: 'sessions/day', estRevenueEur: 2700000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 8500000, askingPriceMax: 10500000, estEbitda: 1020000 },
      { id: 'hel-s-4', name: 'Lauttasaari Sauna Co.', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 180, unitLabel: 'sessions/day', estRevenueEur: 2300000, lmiFit: 8, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 7200000, askingPriceMax: 9000000, estEbitda: 870000 },
      { id: 'hel-s-5', name: 'Saunaboutique Eira', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 3, keysOrSessions: 130, unitLabel: 'sessions/day', estRevenueEur: 1700000, lmiFit: 7, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 5400000, askingPriceMax: 6800000, estEbitda: 640000 },
      { id: 'hel-s-6', name: 'Helsinki Public Saunas', city: 'helsinki', vertical: 'PREMIUM_SAUNAS', coastalRating: 3, keysOrSessions: 620, unitLabel: 'sessions/day', estRevenueEur: 6800000, lmiFit: 5, acquisitionReadiness: 4, status: 'Monitoring', scaleOpportunity: true, askingPriceMin: 17000000, askingPriceMax: 21000000, estEbitda: 2050000 }
    ]
  },
  copenhagen: {
    COASTAL_HOTELS: [
      { id: 'cph-c-1', name: 'Islands Brygge House', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 30, unitLabel: 'keys', estRevenueEur: 5100000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 19000000, askingPriceMax: 23000000, estEbitda: 2050000 },
      { id: 'cph-c-2', name: 'Nordhavn Wharf Hotel', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 38, unitLabel: 'keys', estRevenueEur: 5900000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 22000000, askingPriceMax: 27000000, estEbitda: 2350000 },
      { id: 'cph-c-3', name: 'Christianshavn Quarter', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 24, unitLabel: 'keys', estRevenueEur: 4000000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 14500000, askingPriceMax: 17500000, estEbitda: 1600000 },
      { id: 'cph-c-4', name: 'Refshaleøen Maritime', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 22, unitLabel: 'keys', estRevenueEur: 3800000, lmiFit: 8, acquisitionReadiness: 2, status: 'Monitoring', askingPriceMin: 14000000, askingPriceMax: 17000000, estEbitda: 1520000 },
      { id: 'cph-c-5', name: 'Holmen Boutique', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 16, unitLabel: 'keys', estRevenueEur: 2600000, lmiFit: 7, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 9500000, askingPriceMax: 11500000, estEbitda: 1040000 },
      { id: 'cph-c-6', name: 'Kastrup Coast Inn', city: 'copenhagen', vertical: 'COASTAL_HOTELS', coastalRating: 3, keysOrSessions: 28, unitLabel: 'keys', estRevenueEur: 3300000, lmiFit: 6, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 11000000, askingPriceMax: 13500000, estEbitda: 1320000 }
    ],
    PREMIUM_SAUNAS: [
      { id: 'cph-s-1', name: 'La Banchina Sauna', city: 'copenhagen', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 130, unitLabel: 'sessions/day', estRevenueEur: 1800000, lmiFit: 8, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 5800000, askingPriceMax: 7200000, estEbitda: 680000 },
      { id: 'cph-s-2', name: 'Nordhavn Bath Co.', city: 'copenhagen', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 110, unitLabel: 'sessions/day', estRevenueEur: 1500000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 4800000, askingPriceMax: 6000000, estEbitda: 570000 },
      { id: 'cph-s-3', name: 'Refshaleøen Sauna Hus', city: 'copenhagen', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 90, unitLabel: 'sessions/day', estRevenueEur: 1250000, lmiFit: 7, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 4000000, askingPriceMax: 5000000, estEbitda: 470000 },
      { id: 'cph-s-4', name: 'Kastrup Søbad', city: 'copenhagen', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 75, unitLabel: 'sessions/day', estRevenueEur: 1000000, lmiFit: 7, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 3200000, askingPriceMax: 4000000, estEbitda: 380000 },
      { id: 'cph-s-5', name: 'CPH Sauna Network', city: 'copenhagen', vertical: 'PREMIUM_SAUNAS', coastalRating: 3, keysOrSessions: 380, unitLabel: 'sessions/day', estRevenueEur: 4200000, lmiFit: 5, acquisitionReadiness: 4, status: 'Monitoring', scaleOpportunity: true, askingPriceMin: 11000000, askingPriceMax: 13500000, estEbitda: 1300000 }
    ]
  },
  stockholm: {
    COASTAL_HOTELS: [
      { id: 'sto-c-1', name: 'Djurgården Manor', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 32, unitLabel: 'keys', estRevenueEur: 5200000, lmiFit: 9, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 19500000, askingPriceMax: 24000000, estEbitda: 2080000 },
      { id: 'sto-c-2', name: 'Nacka Strand Hotel', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 38, unitLabel: 'keys', estRevenueEur: 5500000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 20000000, askingPriceMax: 25000000, estEbitda: 2200000 },
      { id: 'sto-c-3', name: 'Skeppsholmen House', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 22, unitLabel: 'keys', estRevenueEur: 3700000, lmiFit: 8, acquisitionReadiness: 2, status: 'Monitoring', askingPriceMin: 13500000, askingPriceMax: 16500000, estEbitda: 1480000 },
      { id: 'sto-c-4', name: 'Vaxholm Archipelago Inn', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 5, keysOrSessions: 18, unitLabel: 'keys', estRevenueEur: 2900000, lmiFit: 8, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 10500000, askingPriceMax: 12500000, estEbitda: 1160000 },
      { id: 'sto-c-5', name: 'Långholmen Bay', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 26, unitLabel: 'keys', estRevenueEur: 3500000, lmiFit: 7, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 12500000, askingPriceMax: 15500000, estEbitda: 1400000 },
      { id: 'sto-c-6', name: 'Lidingö Coast Lodge', city: 'stockholm', vertical: 'COASTAL_HOTELS', coastalRating: 4, keysOrSessions: 20, unitLabel: 'keys', estRevenueEur: 2700000, lmiFit: 7, acquisitionReadiness: 3, status: 'Monitoring', askingPriceMin: 9500000, askingPriceMax: 11500000, estEbitda: 1080000 }
    ],
    PREMIUM_SAUNAS: [
      { id: 'sto-s-1', name: 'Centralbadet Premium', city: 'stockholm', vertical: 'PREMIUM_SAUNAS', coastalRating: 4, keysOrSessions: 220, unitLabel: 'sessions/day', estRevenueEur: 3000000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 9500000, askingPriceMax: 11500000, estEbitda: 1140000 },
      { id: 'sto-s-2', name: 'Sturebadet Wellness', city: 'stockholm', vertical: 'PREMIUM_SAUNAS', coastalRating: 3, keysOrSessions: 180, unitLabel: 'sessions/day', estRevenueEur: 2500000, lmiFit: 7, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 8000000, askingPriceMax: 9800000, estEbitda: 950000 },
      { id: 'sto-s-3', name: 'Skärgården Bath', city: 'stockholm', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 95, unitLabel: 'sessions/day', estRevenueEur: 1300000, lmiFit: 8, acquisitionReadiness: 4, status: 'In Dialogue', askingPriceMin: 4000000, askingPriceMax: 5000000, estEbitda: 490000 },
      { id: 'sto-s-4', name: 'Hellasgården Floating', city: 'stockholm', vertical: 'PREMIUM_SAUNAS', coastalRating: 5, keysOrSessions: 110, unitLabel: 'sessions/day', estRevenueEur: 1500000, lmiFit: 8, acquisitionReadiness: 3, status: 'Active Interest', askingPriceMin: 4800000, askingPriceMax: 6000000, estEbitda: 570000 },
      { id: 'sto-s-5', name: 'Stockholm Mass Saunas', city: 'stockholm', vertical: 'PREMIUM_SAUNAS', coastalRating: 2, keysOrSessions: 540, unitLabel: 'sessions/day', estRevenueEur: 5400000, lmiFit: 5, acquisitionReadiness: 4, status: 'Monitoring', scaleOpportunity: true, askingPriceMin: 13500000, askingPriceMax: 16500000, estEbitda: 1620000 }
    ]
  },
  malta: { COASTAL_HOTELS: [], PREMIUM_SAUNAS: [] },
  greece: { COASTAL_HOTELS: [], PREMIUM_SAUNAS: [] },
  osaka: { COASTAL_HOTELS: [], PREMIUM_SAUNAS: [] }
}
