// ─────────────────────────────────────────────────────────────
// Manual market-news refresh — the in-app "Refresh now" button.
// Requires a valid Supabase session token from a logged-in user
// (verified against Supabase Auth) so the endpoint cannot be
// driven anonymously.
// ─────────────────────────────────────────────────────────────

import { runNewsRefresh } from '../functions-lib/newsCore.mjs'

export default async req => {
  const headers = { 'Content-Type': 'application/json' }

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return new Response(JSON.stringify({ error: 'Sign in required' }), { status: 401, headers })

  // Verify the caller is a real authenticated user of this project
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers })

  try {
    const result = await runNewsRefresh()
    return new Response(JSON.stringify(result), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 502, headers })
  }
}
