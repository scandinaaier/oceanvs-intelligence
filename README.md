# OCEANVS Intelligence Platform (MI8)

Daily-use acquisition intelligence tool for the Oceanvs senior team and a live presentation surface for family offices and institutional LPs. Covers two verticals (coastal hotels, premium saunas) across seven cities split into two tiers (Active Rollup, Investor-Led).

**MI8** merges the Oceanvs CRM workstream into the platform: a Norway sauna operator registry and a Nordic campsite registry, both with filed financials from Brønnøysundregisteret and a shared acquisition CRM (stages, contacts, outreach log, email composer).

## Roll-Up CRM (new in MI8)

| Screen | Route | What it does |
| --- | --- | --- |
| **Sauna Registry** | `/dashboard/saunas` | 69 Norwegian operators (45 matched to the company registry, 38 with filed revenue). Filters: revenue floor (NOK 500k default chip), YoY growth, locations, board size, region, format, stage. Detail view shows filed accounts, CEO/board, unit economics vs the €45k-cabin deck benchmark. |
| **Campsite Registry** | `/dashboard/campsites` | 4,362 Nordic campsites (1,541 Norway, 2,817 waterfront, 963 with sauna). Filters: country, county, waterfront, beach/sauna, city distance, revenue, NOK/m². Land economics per site (plot m² + asking price → NOK/m² vs county waterfront median → "Underpriced" flag). |
| **CRM Board** | `/dashboard/crm` | Kanban across both verticals: Prospect → Outreach → Engaged → Meeting → LOI → Acquired/Passed. Every stage change, contact edit and outreach activity is shared via Supabase; the activity log records who contacted whom, when, through which channel. |

### Data sources

- **Brønnøysundregisteret** (free, keyless): entity facts, CEO + board (owners proxy), latest filed annual accounts. Routed through `netlify/functions/brreg.js` because the accounts API has no CORS headers. *The open API only serves the latest filed year* — earlier years are added manually per target (Proff.no) or accumulate as new filings land; YoY growth computes automatically once two years exist.
- **Seed data**: `public/sauna_seed.json` (regenerate with `node scripts/enrich-brreg.mjs`) and `public/campsite_registry_seed.json` (regenerate with `node scripts/build-campsite-seed.mjs`).
- **Email templates**: `src/data/emailTemplates.ts` — six outreach templates with token personalisation; sending opens the local mail client and logs the touch automatically.

### Enabling the shared CRM

Until migration `006_rollup_crm.sql` is run in the Supabase SQL editor, the registries run read-only from the bundled seed. After the migration, open each registry once and click **Import** to load the seed into Supabase. `007_email_allowlist.sql` (optional but recommended) enforces the team email allowlist in RLS — after running it, also disable open signups in Supabase Auth settings.

## Local development

```bash
npm install
cp .env.example .env   # fill in NewsData key + authorised emails
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Login from the landing page using one of the emails listed in `VITE_AUTHORIZED_EMAILS`.

## Build

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build
```

## Authorised access

Login is gated by an allowlist. The default list is `tauriq@oceanvs.com,andy@oceanvs.com` — override via `VITE_AUTHORIZED_EMAILS` (comma-separated) in `.env`. Sessions persist via `localStorage` until the user signs out.

## City architecture

- **Active Rollup** — Oslo, Helsinki, Copenhagen, Stockholm. Oceanvs acquires existing operators. Surfaces fragmentation, acquisition readiness, ADR, and operator pipeline.
- **Investor-Led** — Malta, Porto Heli (Greece), Osaka. An anchor investor acquires the asset; Oceanvs deploys brand and operations on top. Surfaces HNWI convergence, asset context, investor relationship, and deployment timeline.

## LMI

Oceanvs Lifestyle Market Index is a proprietary 0-100 composite. Methodology is internal — the UI exposes the score, component breakdown, trend, and comparables, but never the formula. Components: Premium Membership Density, HNWI Convergence Signal, Coastal Access Quality, Wellness Spend Index, Regulatory Openness.

## Live API integrations

| API | File | Stale time | Purpose |
| --- | --- | --- | --- |
| NewsData.io | `src/api/signals.ts` | 4 hours | News-derived signals on City Overview |
| exchangerate.host | `src/api/signals.ts` | 24 hours | EUR cross-rate signal for non-EUR cities |
| Open-Meteo | `src/api/signals.ts` | 6 hours | Sauna Demand Pressure signal (Premium Saunas only) |

If `VITE_NEWSDATA_API_KEY` is missing or quota-limited, signals fall back to curated mock data with a `Using cached data` label.

## Swapping mock data for live APIs

All non-live data lives in `src/data/mock/` and is fetched through `src/api/`. Each API function carries an inline `LIVE API:` comment showing the expected endpoint and response shape. Swap the body of any function from `Promise.resolve(mock)` to a real `fetch` and the rest of the app continues to work unchanged because all data flows through React Query.

## Environment variables

| Var | Required | Description |
| --- | --- | --- |
| `VITE_NEWSDATA_API_KEY` | Optional | NewsData.io free tier key. Falls back to mock if missing. |
| `VITE_EXCHANGERATE_KEY` | No | Reserved — exchangerate.host is open. |
| `VITE_OPEN_METEO_KEY` | No | Reserved — Open-Meteo is open. |
| `VITE_AUTHORIZED_EMAILS` | Recommended | Comma-separated allowlist of login emails. |

## Deploy workflow

This repo is connected to Netlify via the GitHub repository. After the initial deploy, future changes deploy automatically:

```bash
git add .
git commit -m "your message"
git push origin main
```

Netlify picks up the push and redeploys to production. To switch to a custom domain, change DNS in the Netlify dashboard — no rebuild needed.
