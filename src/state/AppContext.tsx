import React, { createContext, useContext, useState } from 'react'
import type { CityKey, Vertical } from '../types'
import { CITIES } from '../data/mock/cities'

interface AppState {
  city: CityKey
  vertical: Vertical
  setCity: (c: CityKey) => void
}

const Ctx = createContext<AppState | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCity] = useState<CityKey>('oslo')
  // The city implies the vertical: Nordic active-rollup cities are the
  // sauna/campsite roll-up, investor-led coastal cities are HOW hotel
  // deployments. The old manual toggle was removed in MI8.
  const tier = CITIES.find(c => c.key === city)?.tier
  const vertical: Vertical = tier === 'INVESTOR_LED' ? 'COASTAL_HOTELS' : 'PREMIUM_SAUNAS'
  return <Ctx.Provider value={{ city, vertical, setCity }}>{children}</Ctx.Provider>
}

export const useApp = (): AppState => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
