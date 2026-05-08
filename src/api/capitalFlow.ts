import { CAPITAL_EVENTS } from '../data/mock/marketIntel'
import type { CityKey, CapitalEvent } from '../types'

export async function fetchCapitalEvents(city: CityKey): Promise<CapitalEvent[]> {
  return Promise.resolve(CAPITAL_EVENTS[city] ?? [])
}
