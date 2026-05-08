import React, { createContext, useContext, useState } from 'react'
import type { CityKey, Vertical } from '../types'

interface AppState {
  city: CityKey
  vertical: Vertical
  setCity: (c: CityKey) => void
  setVertical: (v: Vertical) => void
}

const Ctx = createContext<AppState | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCity] = useState<CityKey>('oslo')
  const [vertical, setVertical] = useState<Vertical>('COASTAL_HOTELS')
  return <Ctx.Provider value={{ city, vertical, setCity, setVertical }}>{children}</Ctx.Provider>
}

export const useApp = (): AppState => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
