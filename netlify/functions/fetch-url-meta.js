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

    // Most sites: OG tags live in <head>, so 100KB and stop at </head> is plenty.
    // Finn.no: the asking price ("Prisantydning") sits in the <body> — its JSON
    // form is at ~36KB and the visible DOM element at ~150–205KB — so we must keep
    // reading past </head>. 250KB covers price, location and image URLs.
    const isFinnHost = parsedUrl.hostname.includes('finn.no')
    const MAX_BYTES = isFinnHost ? 250_000 : 100_000

    const reader = res.body.getReader()
    let html = ''
    let bytesRead = 0

    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      bytesRead += value.length
      // Non-Finn pages: OG tags are in <head>, so stop early once we pass it.
      if (!isFinnHost && html.includes('</head>')) break
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
        priceNok: 0,
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
