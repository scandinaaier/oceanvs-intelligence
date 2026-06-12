// Local runner for the market-news harvest. Expects VITE_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY (and optionally DEEPL_API_KEY) in env.
// Usage: node scripts/run-news-refresh.mjs
import { runNewsRefresh } from '../netlify/functions-lib/newsCore.mjs'

const result = await runNewsRefresh()
console.log(JSON.stringify(result, null, 2))
