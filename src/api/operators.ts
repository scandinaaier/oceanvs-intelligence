import { OPERATORS } from '../data/mock/operators'
import { BRAND_DEPLOYMENT } from '../data/mock/brandDeployment'
import type { CityKey, Vertical, Operator, BrandDeployment } from '../types'

export async function fetchOperators(city: CityKey, vertical: Vertical): Promise<Operator[]> {
  // LIVE API: return fetch(`/api/operators?city=${city}&vertical=${vertical}`).then(r => r.json())
  return Promise.resolve(OPERATORS[city]?.[vertical] ?? [])
}

export async function fetchAllOperators(): Promise<Operator[]> {
  // LIVE API: return fetch('/api/operators?all=1').then(r => r.json())
  const all: Operator[] = []
  for (const city of Object.keys(OPERATORS) as CityKey[]) {
    for (const v of ['COASTAL_HOTELS', 'PREMIUM_SAUNAS'] as Vertical[]) {
      all.push(...OPERATORS[city][v])
    }
  }
  return Promise.resolve(all)
}

export async function fetchBrandDeployment(city: CityKey, vertical: Vertical): Promise<BrandDeployment | null> {
  return Promise.resolve(BRAND_DEPLOYMENT[city]?.[vertical] ?? null)
}
