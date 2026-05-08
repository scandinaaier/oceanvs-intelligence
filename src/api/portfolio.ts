import { GAP_MARKETS } from '../data/mock/gapMarkets'
import type { GapMarket } from '../types'

export async function fetchGapMarkets(): Promise<GapMarket[]> {
  return Promise.resolve(GAP_MARKETS)
}
