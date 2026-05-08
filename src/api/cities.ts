import { CITIES, CITY_KPIS, CITY_BRIEFS } from '../data/mock/cities'
import type { CityKey, Vertical } from '../types'

export async function fetchCities() {
  // LIVE API: replace with real endpoint, expected response: CityMeta[]
  return Promise.resolve(CITIES)
}

export async function fetchCityKpi(city: CityKey, vertical: Vertical) {
  // LIVE API: replace with `fetch(\`/api/cities/${city}/kpi?vertical=${vertical}\`)`
  return Promise.resolve(CITY_KPIS[city][vertical])
}

export async function fetchCityBrief(city: CityKey, vertical: Vertical) {
  // LIVE API: replace with markdown CMS fetch
  return Promise.resolve(CITY_BRIEFS[city][vertical])
}
