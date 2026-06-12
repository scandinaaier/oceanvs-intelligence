// ─────────────────────────────────────────────────────────────
// Scheduled market-news harvest — runs every Monday 06:00 UTC.
// Netlify invokes this on the cron schedule below; it is not
// reachable over HTTP. Manual refresh goes through
// news-refresh-now.mjs instead.
// ─────────────────────────────────────────────────────────────

import { runNewsRefresh } from '../functions-lib/newsCore.mjs'

export default async () => {
  const result = await runNewsRefresh()
  console.log('[news-refresh]', JSON.stringify(result))
}

export const config = {
  schedule: '0 6 * * 1',
}
