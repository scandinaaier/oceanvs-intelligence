// Netlify Function — fetch-url-meta
// Fetches any URL and extracts Open Graph metadata server-side.
// Avoids CORS issues since this runs on Netlify's servers, not the browser.

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

    // Only read first 100KB — OG tags are always in <head>
    const reader = res.body.getReader()
    let html = ''
    let bytesRead = 0
    const MAX_BYTES = 100_000

    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      bytesRead += value.length
      // Stop once we've passed </head>
      if (html.includes('</head>')) break
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

      const priceMatch = html.match(/data-testid="pricing-indicative-price"[^>]*>.*?<span[^>]*>([\d\s]+)\s*kr/s)
      priceNok = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0

      const locMatch = html.match(/data-testid="(?:object-address|location)"[^>]*>(.*?)<\//s)
      const location = locMatch ? locMatch[1].replace(/<[^>]+>/g, '').trim() : ''

      const regionMatch = (finnTitle + ' ' + location).match(/(Vestfold|Østfold|Vestland|Agder|Møre og Romsdal|Trøndelag|Nordland|Troms|Rogaland|Telemark|Buskerud|Hedmark|Innlandet|Viken|Finnmark|Akershus|Oslo|Hordaland|Rogaland|Sogn og Fjordane)/i)

      // All images
      const imgMatches = [...html.matchAll(/https:\/\/images\.finncdn\.no\/dynamic\/(?:1600w|1280w)[^\"\s\)']+/g)]
      const images = [...new Set(imgMatches.map(m => m[0]))].slice(0, 10)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: finnTitle || title,
          description,
          image: images[0] || image,
          images,
          siteName: 'Finn.no',
          priceNok,
          finnkode,
          location,
          region: regionMatch ? regionMatch[1] : '',
          isFinn: true,
          url,
        })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title,
        description,
        image,
        images: image ? [image] : [],
        siteName,
        priceNok: 0,
        finnkode: null,
        location: '',
        region: '',
        isFinn: false,
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
