import { LMI_DATA } from '../data/mock/lmi'
import type { CityKey, LmiBreakdown } from '../types'

export async function fetchLmi(city: CityKey): Promise<LmiBreakdown> {
  return Promise.resolve(LMI_DATA[city])
}
