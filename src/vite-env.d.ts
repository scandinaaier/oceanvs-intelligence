/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEWSDATA_API_KEY?: string
  readonly VITE_EXCHANGERATE_KEY?: string
  readonly VITE_OPEN_METEO_KEY?: string
  readonly VITE_AUTHORIZED_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
