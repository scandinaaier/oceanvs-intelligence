// ─────────────────────────────────────────────────────────────
// Market news harvest core — shared by the weekly scheduled
// function and the in-app "Refresh now" endpoint.
//
// Source: Google News RSS (keyless, no quota at this volume).
// Norwegian headlines are translated via DeepL when a key is set.
// Rows are upserted into Supabase market_news with the service
// role key (cron has no user session).
// ─────────────────────────────────────────────────────────────

// Standing searches — the market lenses the thesis cares about.
export const QUERIES = [
  { tag: 'sauna-norge', q: 'badstu OR "flytende badstu" OR saunagründer', hl: 'no', gl: 'NO', ceid: 'NO:no' },
  { tag: 'sauna-nordic', q: 'sauna wellness Norway OR Nordic investment OR expansion', hl: 'en-US', gl: 'US', ceid: 'US:en' },
  { tag: 'camping-norge', q: 'campingplass solgt OR oppkjøp OR "til salgs"', hl: 'no', gl: 'NO', ceid: 'NO:no' },
  { tag: 'camping-ma', q: 'campsite OR campground OR "holiday park" acquisition Europe', hl: 'en-US', gl: 'US', ceid: 'US:en' },
  { tag: 'wellness-ma', q: 'wellness OR spa OR bathhouse acquisition hospitality', hl: 'en-US', gl: 'US', ceid: 'US:en' },
  { tag: 'coastal-hospitality', q: 'coastal resort OR waterfront hotel investment Nordic OR Scandinavia', hl: 'en-US', gl: 'US', ceid: 'US:en' },
]

const MAX_PER_QUERY = 12
const MAX_AGE_DAYS = 45

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .trim()
}

function parseRss(xml) {
  const items = []
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1]
    const pick = tag => {
      const r = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return r ? decodeEntities(r[1]) : null
    }
    const title = pick('title')
    const link = pick('link')
    if (!title || !link) continue
    items.push({
      title,
      url: link,
      source: pick('source'),
      published_at: pick('pubDate') ? new Date(pick('pubDate')).toISOString() : null,
    })
  }
  return items
}

async function fetchQuery({ tag, q, hl, gl, ceid }) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${ceid}`
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; OceanvsIntel/1.0)', accept: 'application/rss+xml,application/xml' },
  })
  if (!res.ok) throw new Error(`Google News RSS ${res.status} for ${tag}`)
  const xml = await res.text()
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  return parseRss(xml)
    .filter(i => !i.published_at || new Date(i.published_at).getTime() >= cutoff)
    .slice(0, MAX_PER_QUERY)
    .map(i => ({ ...i, query_tag: tag, norwegian: hl === 'no' }))
}

async function translateTitles(items, deeplKey) {
  if (!deeplKey || items.length === 0) return items
  const endpoint = deeplKey.endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate'
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${deeplKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: items.map(i => i.title), target_lang: 'EN-GB' }),
    })
    if (!res.ok) return items
    const data = await res.json()
    return items.map((item, idx) => {
      const translated = data.translations?.[idx]?.text
      return translated && translated !== item.title
        ? { ...item, title_original: item.title, title: translated }
        : item
    })
  } catch {
    return items // translation is best-effort, never blocks the harvest
  }
}

export async function runNewsRefresh() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

  const results = await Promise.allSettled(QUERIES.map(fetchQuery))
  let items = []
  const errors = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') items.push(...r.value)
    else errors.push(`${QUERIES[i].tag}: ${r.reason?.message}`)
  })

  // Dedupe within the batch by URL
  const seen = new Set()
  items = items.filter(i => (seen.has(i.url) ? false : (seen.add(i.url), true)))

  // Translate the Norwegian batch
  const norwegian = items.filter(i => i.norwegian)
  const translated = await translateTitles(norwegian, process.env.DEEPL_API_KEY)
  items = items.filter(i => !i.norwegian).concat(translated)

  const rows = items.map(({ norwegian: _n, ...row }) => ({ ...row, title_original: row.title_original ?? null }))

  // Legacy service_role keys are JWTs and need the Bearer header;
  // new sb_secret_ keys authenticate through `apikey` alone.
  const authHeaders = { apikey: serviceKey }
  if (serviceKey.startsWith('eyJ')) authHeaders.Authorization = `Bearer ${serviceKey}`

  const res = await fetch(`${supabaseUrl}/rest/v1/market_news?on_conflict=url`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`Supabase upsert failed ${res.status}: ${(await res.text()).slice(0, 300)}`)

  return { harvested: rows.length, queries: QUERIES.length, errors }
}
