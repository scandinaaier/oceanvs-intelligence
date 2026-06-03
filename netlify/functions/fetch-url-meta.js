// Netlify Function — fetch-url-meta
// Fetches any URL and extracts Open Graph metadata server-side.
// Avoids CORS issues since this runs on Netlify's servers, not the browser.
// Optionally translates Norwegian content to English via DeepL (set DEEPL_API_KEY in Netlify env vars).

// ── DeepL translation helper ──────────────────────────────
// Free keys end in :fx and use api-free.deepl.com
// Paid keys use api.deepl.com
async function translateToEnglish(texts) {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return { result: null, error: 'NO_KEY' }

  const nonEmpty = texts.map(t => t || '')
  if (nonEmpty.every(t => !t.trim())) return { result: null, error: 'EMPTY_INPUT' }

  // Auto-detect which endpoint to use based on key format
  const endpoint = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  try {
    const params = new URLSearchParams()
    nonEmpty.forEach(t => params.append('text', t))
    params.append('target_lang', 'EN-US')
    // source_lang intentionally omitted — DeepL auto-detects accurately
    // and 'NO' is not a valid DeepL code (use NB for Norwegian Bokmål)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => res.status.toString())
      return { result: null, error: `DEEPL_${res.status}: ${errText.slice(0, 120)}` }
    }

    const data = await res.json()
    return { result: data.translations.map(t => t.text), error: null }
  } catch (e) {
    return { result: null, error: `EXCEPTION: ${e.message}` }
  }
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const url = event.queryStringParameters?.url
  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'url parameter required' }) }
  }

  // Validate URL
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid URL' }) }
  }

  try {
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'no-NO,no;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: `Fetch failed: ${res.status}`, partial: true }) }
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'Not an HTML page', partial: true }) }
    }

    // Read up to 250KB of the body for every host. Price data is not confined to
    // <head>: JSON-LD <script> blocks, Finn's ad-targeting JSON (~36KB) and visible
    // price elements (~150–205KB) all live further down. 250KB streams in well under
    // the request timeout and covers title/price/location/images on the sites we hit.
    const MAX_BYTES = 250_000

    const reader = res.body.getReader()
    let html = ''
    let bytesRead = 0

    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      bytesRead += value.length
    }
    reader.cancel()

    // ── Extract OG / meta tags ────────────────────────────
    const og = (prop) => {
      const m = html.match(new RegExp(`(?:property|name)=["'](?:og:)?${prop}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                html.match(new RegExp(`content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:)?${prop}["']`, 'i'))
      return m ? m[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim() : ''
    }

    const title      = og('og:title') || og('title') || extractTag(html, 'title') || ''
    const description = og('og:description') || og('description') || ''
    const image      = og('og:image') || ''
    const siteName   = og('og:site_name') || parsedUrl.hostname.replace('www.', '')

    // Finn.no specific extraction
    let priceNok = 0
    let finnkode = null
    let isFinn = false

    if (parsedUrl.hostname.includes('finn.no')) {
      isFinn = true
      const fkMatch = url.match(/finnkode=(\d+)/)
      finnkode = fkMatch ? fkMatch[1] : null

      const titleTag = html.match(/<title>(.*?)(?:\s*\|\s*FINN[^<]*)?<\/title>/)
      const finnTitle = titleTag ? titleTag[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim() : ''

      // Asking price. Primary source is Finn's ad-targeting JSON, which carries the
      // price as a clean integer string with no separators, e.g.:
      //   {"key":"price","value":["20000000"]}
      // Fallback is the visible DOM element, where the value uses spaces / non-breaking
      // spaces as thousand separators, e.g.:
      //   data-testid="pricing-indicative-price"...<span ...>20 000 000 kr</span>
      const jsonPrice = html.match(/"key":"price","value":\["(\d+)"\]/)
      if (jsonPrice) {
        priceNok = parseInt(jsonPrice[1], 10)
      } else {
        const domPrice = html.match(/data-testid="pricing-indicative-price"[\s\S]*?<span[^>]*>([\d\s ]+)\s*kr/)
        priceNok = domPrice ? parseInt(domPrice[1].replace(/[\s ]/g, ''), 10) : 0
      }
      if (!Number.isFinite(priceNok)) priceNok = 0

      const locMatch = html.match(/data-testid="(?:object-address|location)"[^>]*>(.*?)<\//s)
      const location = locMatch ? locMatch[1].replace(/<[^>]+>/g, '').trim() : ''

      const regionMatch = (finnTitle + ' ' + location).match(/(Vestfold|Østfold|Vestland|Agder|Møre og Romsdal|Trøndelag|Nordland|Troms|Rogaland|Telemark|Buskerud|Hedmark|Innlandet|Viken|Finnmark|Akershus|Oslo|Hordaland|Rogaland|Sogn og Fjordane)/i)

      // All images
      const imgMatches = [...html.matchAll(/https:\/\/images\.finncdn\.no\/dynamic\/(?:1600w|1280w)[^\"\s\)']+/g)]
      const images = [...new Set(imgMatches.map(m => m[0]))].slice(0, 10)

      // Translate Norwegian title + description to English via DeepL
      const rawTitle = finnTitle || title
      const { result: translations, error: translateError } = await translateToEnglish([rawTitle, description])
      const finalTitle       = translations?.[0] || rawTitle
      const finalDescription = translations?.[1] || description

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: finalTitle,
          titleOriginal: rawTitle,
          description: finalDescription,
          image: images[0] || image,
          images,
          siteName: 'Finn.no',
          priceNok,
          price: priceNok,          // generic price (Finn listings are always NOK)
          currency: 'NOK',
          finnkode,
          location,
          region: regionMatch ? regionMatch[1] : '',
          isFinn: true,
          translated: !!translations,
          translateError,           // null on success, error string on failure — helps diagnose
          deeplConfigured: !!process.env.DEEPL_API_KEY,
          url,
        })
      }
    }

    // Universal price + currency extraction (JSON-LD, OpenGraph, microdata, then a
    // conservative currency-symbol fallback). Works for any site that exposes the
    // price in its server HTML; bot-walled / JS-only portals return 0 and the user
    // types the price manually in the Add Signal form.
    const { price, currency } = extractPrice(html, parsedUrl.hostname)

    // Translate if the page appears to be Norwegian (no, nb, nn content-language or .no domain)
    const contentLang = res.headers.get('content-language') || ''
    const isNorwegian = /\bno\b|\bnb\b|\bnn\b/i.test(contentLang) || parsedUrl.hostname.endsWith('.no')
    let finalTitle = title
    let finalDescription = description
    let wasTranslated = false

    let translateError = null
    if (isNorwegian && (title || description)) {
      const { result: translations, error: tErr } = await translateToEnglish([title, description])
      translateError = tErr
      if (translations) {
        finalTitle       = translations[0] || title
        finalDescription = translations[1] || description
        wasTranslated    = true
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: finalTitle,
        titleOriginal: isNorwegian ? title : undefined,
        description: finalDescription,
        image,
        images: image ? [image] : [],
        siteName,
        priceNok: price,            // back-compat: numeric amount (may be non-NOK)
        price,
        currency,
        finnkode: null,
        location: '',
        region: '',
        isFinn: false,
        translated: wasTranslated,
        translateError,
        deeplConfigured: !!process.env.DEEPL_API_KEY,
        url,
      })
    }

  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: err.message, partial: true })
    }
  }
}

function extractTag(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

// ── Universal price + currency extraction ─────────────────
// Returns { price: <integer amount>, currency: <ISO 4217 code> }. price is 0 when
// no reliable price is found (the user then enters it manually).

const SYMBOL_CURRENCY = { '€': 'EUR', '£': 'GBP', '$': 'USD' }

// Best-guess currency for a host when the price source doesn't state one.
function currencyForHost(hostname) {
  const h = hostname.toLowerCase()
  if (h.endsWith('.no')) return 'NOK'
  if (h.endsWith('.se')) return 'SEK'
  if (h.endsWith('.dk')) return 'DKK'
  if (h.endsWith('.is')) return 'ISK'
  if (h.endsWith('.ch')) return 'CHF'
  if (h.endsWith('.uk') || h.endsWith('.co.uk')) return 'GBP'
  if (h.endsWith('.us') || h.endsWith('.com')) return 'EUR' // .com is ambiguous; EUR is the safer default for this pipeline
  return 'EUR' // most of our target markets (FI, GR, DE, FR, ES, IT, PT) are euro
}

// Parse a human price string into an integer. Handles "250000", "250.000",
// "250 000", "1,200,000", "1.200.000,50", "250000.00", non-breaking spaces.
function parseAmount(raw) {
  if (raw == null) return 0
  let s = String(raw).replace(/[\s ]/g, '')
  s = s.replace(/[.,]\d{2}$/, '')   // drop a trailing 2-digit decimal part
  s = s.replace(/[.,]/g, '')        // remaining . and , are thousand separators
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

// Walk a parsed JSON-LD value looking for an Offer-style price + currency.
function priceFromJsonLd(node) {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const item of node) { const r = priceFromJsonLd(item); if (r) return r }
    return null
  }
  const priceRaw = node.price ?? node.lowPrice ?? node.highPrice
  if (priceRaw != null) {
    const amount = parseAmount(priceRaw)
    if (amount) {
      const cur = typeof node.priceCurrency === 'string' ? node.priceCurrency.toUpperCase() : null
      return { amount, currency: cur }
    }
  }
  for (const key of ['offers', 'priceSpecification', '@graph', 'makesOffer', 'itemOffered']) {
    if (node[key]) { const r = priceFromJsonLd(node[key]); if (r) return r }
  }
  return null
}

function extractPrice(html, hostname) {
  const fallbackCurrency = currencyForHost(hostname)

  // Finn.no — ad-targeting JSON (clean integer, always NOK), with the visible
  // "Prisantydning" element as a secondary source.
  if (hostname.includes('finn.no')) {
    const m = html.match(/"key":"price","value":\["(\d+)"\]/)
    if (m) return { price: parseInt(m[1], 10), currency: 'NOK' }
    const dom = html.match(/data-testid="pricing-indicative-price"[\s\S]*?<span[^>]*>([\d\s ]+)\s*kr/)
    if (dom) return { price: parseAmount(dom[1]), currency: 'NOK' }
  }

  // 1) JSON-LD <script> blocks (schema.org Product/Offer/RealEstateListing)
  for (const block of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    const text = block[1].trim()
    try {
      const r = priceFromJsonLd(JSON.parse(text))
      if (r) return { price: r.amount, currency: r.currency || fallbackCurrency }
    } catch {
      // Malformed/concatenated JSON-LD — fall back to regex on the block text
      const p = text.match(/"(?:price|lowPrice)"\s*:\s*"?([\d.,]+)"?/)
      if (p && parseAmount(p[1])) {
        const c = text.match(/"priceCurrency"\s*:\s*"([A-Za-z]{3})"/)
        return { price: parseAmount(p[1]), currency: c ? c[1].toUpperCase() : fallbackCurrency }
      }
    }
  }

  // 2) OpenGraph / product price meta tags (amount + currency in any attribute order)
  const ogAmt = html.match(/(?:product:price:amount|og:price:amount)["'][^>]*content=["']([\d.,]+)["']/i)
             || html.match(/content=["']([\d.,]+)["'][^>]*(?:product:price:amount|og:price:amount)["']/i)
  if (ogAmt && parseAmount(ogAmt[1])) {
    const ogCur = html.match(/(?:product:price:currency|og:price:currency)["'][^>]*content=["']([A-Za-z]{3})["']/i)
                || html.match(/content=["']([A-Za-z]{3})["'][^>]*(?:product:price:currency|og:price:currency)["']/i)
    return { price: parseAmount(ogAmt[1]), currency: ogCur ? ogCur[1].toUpperCase() : fallbackCurrency }
  }

  // 3) Microdata itemprop="price" (+ optional itemprop="priceCurrency")
  const ip = html.match(/itemprop=["']price["'][^>]*content=["']([\d.,]+)["']/i)
          || html.match(/content=["']([\d.,]+)["'][^>]*itemprop=["']price["']/i)
  if (ip && parseAmount(ip[1])) {
    const ipc = html.match(/itemprop=["']priceCurrency["'][^>]*content=["']([A-Za-z]{3})["']/i)
    return { price: parseAmount(ip[1]), currency: ipc ? ipc[1].toUpperCase() : fallbackCurrency }
  }

  // 4) Conservative currency-symbol fallback. Only accepts a plausible asking price
  //    (>= 10,000) sitting next to a currency token, to avoid matching fees, sizes
  //    or phone numbers. Scans visible text with tags stripped.
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ')
  const NUM = '\\d{1,3}(?:[ . ]\\d{3})+(?:,\\d{2})?'  // grouped thousands, e.g. 250 000 / 250.000
  const patterns = [
    { re: new RegExp(`([€£$])\\s?(${NUM})`), curFromSym: true },                          // €250.000
    { re: new RegExp(`(${NUM})\\s?([€£$])`), curFromSym: true, numFirst: true },          // 250.000€
    { re: new RegExp(`\\b(NOK|SEK|DKK|EUR|GBP|USD|CHF|ISK)\\s?(${NUM})`, 'i'), code: true },
    { re: new RegExp(`(${NUM})\\s?(NOK|SEK|DKK|EUR|GBP|USD|CHF|ISK|kr|:-)`, 'i'), code: true, numFirst: true },
  ]
  for (const p of patterns) {
    const m = text.match(p.re)
    if (!m) continue
    const numStr = p.numFirst ? m[1] : m[2]
    const token  = p.numFirst ? m[2] : m[1]
    const amount = parseAmount(numStr)
    if (amount < 10000) continue
    let currency = fallbackCurrency
    if (p.curFromSym) currency = SYMBOL_CURRENCY[token] || fallbackCurrency
    else if (/^(NOK|SEK|DKK|EUR|GBP|USD|CHF|ISK)$/i.test(token)) currency = token.toUpperCase()
    // "kr" / ":-" are ambiguous (NOK/SEK/DKK) — keep the host-based guess.
    return { price: amount, currency }
  }

  return { price: 0, currency: fallbackCurrency }
}

// Exported for unit testing (Netlify only invokes `handler`).
export { extractPrice, parseAmount, currencyForHost }
