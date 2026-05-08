import { TRENDS } from '../data/mock/marketIntel'
import type { CityKey, TrendCard } from '../types'

export async function fetchTrends(city: CityKey): Promise<TrendCard[]> {
  return Promise.resolve(TRENDS[city] ?? [])
}
