export const API_CONFIG = {
  newsdata: {
    baseUrl: 'https://newsdata.io/api/1/news',
    key: import.meta.env.VITE_NEWSDATA_API_KEY ?? ''
  },
  exchangerate: {
    baseUrl: 'https://api.exchangerate.host/latest'
  },
  openMeteo: {
    baseUrl: 'https://api.open-meteo.com/v1/forecast'
  }
}

export const STALE_TIMES = {
  news: 4 * 60 * 60 * 1000,
  currency: 24 * 60 * 60 * 1000,
  weather: 6 * 60 * 60 * 1000,
  static: Infinity
}

export const AUTHORIZED_EMAILS = (
  import.meta.env.VITE_AUTHORIZED_EMAILS ?? 'tauriq@oceanvs.com,andy@oceanvs.com'
)
  .split(',')
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean)
