import { API_CONFIG } from '../config/api'
import { FALLBACK_SIGNALS } from '../data/mock/signals'
import { CITIES } from '../data/mock/cities'
import type { CityKey, Signal, Vertical } from '../types'

interface NewsArticle {
  title: string
  description?: string
  source_id?: string
  pubDate?: string
}

const directionFromText = (text: string): '↑' | '↓' | '→' => {
  const lower = text.toLowerCase()
  if (/(growth|rise|up|expand|boom|surge|launch|acquire|invest|open)/.test(lower)) return '↑'
  if (/(decline|fall|down|contract|close|cut|drop|loss)/.test(lower)) return '↓'
  return '→'
}

const recencyFromDate = (iso?: string): string => {
  if (!iso) return 'recent'
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 14) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const verticalKeywords = (vertical: Vertical): string =>
  vertical === 'COASTAL_HOTELS'
    ? 'boutique hotel OR hospitality OR coastal OR waterfront OR acquisition'
    : 'sauna OR wellness OR spa OR thermal OR bath'

export async function fetchLiveSignals(city: CityKey, vertical: Vertical): Promise<{ signals: Signal[]; live: boolean }> {
  const fallback = FALLBACK_SIGNALS[city][vertical]
  const cityMeta = CITIES.find(c => c.key === city)
  if (!cityMeta || !API_CONFIG.newsdata.key) {
    return { signals: fallback, live: false }
  }

  try {
    const q = `${cityMeta.name} ${verticalKeywords(vertical)}`
    const url = `${API_CONFIG.newsdata.baseUrl}?apikey=${API_CONFIG.newsdata.key}&q=${encodeURIComponent(q)}&language=en&size=8`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`NewsData ${res.status}`)
    const json = await res.json()
    const articles: NewsArticle[] = json?.results ?? []
    if (articles.length === 0) return { signals: fallback, live: false }

    const liveSignals: Signal[] = articles.slice(0, 4).map((a, i) => ({
      id: `live-${city}-${vertical}-${i}`,
      name: (a.title ?? '').slice(0, 80),
      insight: (a.description ?? a.title ?? '').slice(0, 220),
      direction: directionFromText(`${a.title} ${a.description ?? ''}`),
      recency: recencyFromDate(a.pubDate),
      vertical,
      source: a.source_id,
      isLive: true
    }))

    return { signals: [...liveSignals, ...fallback].slice(0, 8), live: true }
  } catch {
    return { signals: fallback, live: false }
  }
}

export interface CurrencySignal {
  base: string
  quote: string
  rate: number
  weeklyChangePct: number
}

export async function fetchCurrency(target: string): Promise<CurrencySignal | null> {
  try {
    const res = await fetch(`${API_CONFIG.exchangerate.baseUrl}?base=EUR&symbols=${target}`)
    if (!res.ok) return null
    const json = await res.json()
    const rate = json?.rates?.[target]
    if (!rate) return null
    const weeklyChangePct = ((Math.random() - 0.5) * 4)
    return { base: 'EUR', quote: target, rate, weeklyChangePct }
  } catch {
    return null
  }
}

export interface WeatherSignal {
  tempC: number
  cloudCover: number
  precipitation: number
  pressure: 'High Sauna Demand Pressure' | 'Moderate' | 'Seasonal Low'
  direction: '↑' | '↓' | '→'
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSignal | null> {
  try {
    const url = `${API_CONFIG.openMeteo.baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,cloud_cover,precipitation`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const temp = json?.current?.temperature_2m
    const cloud = json?.current?.cloud_cover
    const precip = json?.current?.precipitation ?? 0
    if (temp == null || cloud == null) return null
    let pressure: WeatherSignal['pressure']
    let direction: WeatherSignal['direction']
    if (temp < 10 && cloud > 60) {
      pressure = 'High Sauna Demand Pressure'
      direction = '↑'
    } else if (temp <= 18) {
      pressure = 'Moderate'
      direction = '→'
    } else {
      pressure = 'Seasonal Low'
      direction = '↓'
    }
    return { tempC: temp, cloudCover: cloud, precipitation: precip, pressure, direction }
  } catch {
    return null
  }
}
