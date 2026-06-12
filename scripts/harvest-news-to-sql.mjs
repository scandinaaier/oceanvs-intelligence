// One-time local news harvest → SQL insert file (no service key needed;
// the SQL runs in the Supabase editor as postgres). Re-runnable.
// Usage: node scripts/harvest-news-to-sql.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { QUERIES } from '../netlify/functions-lib/newsCore.mjs'

// Reuse the fetch/parse internals by re-importing the module's pieces is
// not possible (they are not exported) — run the public path instead:
// we temporarily monkey-patch fetch to intercept the Supabase upsert and
// emit SQL instead of writing over REST.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'news_seed_insert.sql')

process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://intercepted.local'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'intercepted'

const realFetch = globalThis.fetch
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('/rest/v1/market_news')) {
    const rows = JSON.parse(opts.body)
    const json = JSON.stringify(rows).replace(/'/g, "''")
    const sql = `insert into public.market_news (title, title_original, url, source, query_tag, published_at)
select title, title_original, url, source, query_tag, published_at::timestamptz
from jsonb_populate_recordset(null::public.market_news, '${json}'::jsonb)
on conflict (url) do nothing;`
    fs.writeFileSync(OUT, sql)
    console.log(`Wrote ${rows.length} headlines → ${OUT}`)
    return new Response(null, { status: 201 })
  }
  return realFetch(url, opts)
}

const { runNewsRefresh } = await import('../netlify/functions-lib/newsCore.mjs')
const result = await runNewsRefresh()
console.log(JSON.stringify(result, null, 2))
