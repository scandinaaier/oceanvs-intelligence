-- ============================================================
-- MI8 migration 008 — live market intelligence
--   market_news     weekly Google News RSS harvest (cron-written)
--   capital_events  curated deal tracker (replaces the mock
--                   Capital Flow data on /dashboard/intel)
-- Idempotent: safe to re-run. Requires 007 (is_authorized()).
-- ============================================================

create table if not exists public.market_news (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  title_original  text,                          -- pre-translation (Norwegian)
  url             text unique not null,
  source          text,
  query_tag       text,                          -- which standing search caught it
  published_at    timestamptz,
  fetched_at      timestamptz default now(),
  promoted        boolean default false,         -- promoted into capital_events
  archived        boolean default false
);

create index if not exists idx_market_news_published on public.market_news(published_at desc);
create index if not exists idx_market_news_tag on public.market_news(query_tag);

create table if not exists public.capital_events (
  id          uuid default gen_random_uuid() primary key,
  event_date  date not null,
  investor    text not null,
  target      text not null,
  deal_eur    bigint,                            -- null = undisclosed
  subsector   text not null check (subsector in
    ('Thermal & Sauna', 'Boutique Hotel', 'Wellness Real Estate',
     'Longevity', 'F&B Wellness', 'Camping & Outdoor')),
  source_url  text,
  notes       text,
  created_by  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_capital_events_date on public.capital_events(event_date desc);
create index if not exists idx_capital_events_subsector on public.capital_events(subsector);

-- ── RLS ───────────────────────────────────────────────────
alter table public.market_news enable row level security;
alter table public.capital_events enable row level security;

-- market_news: the cron writes with the service role (bypasses RLS);
-- allowlisted users read and flag (promote / archive).
do $$ begin
  create policy "Allowlisted read news" on public.market_news for select to authenticated using (public.is_authorized());
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Allowlisted update news" on public.market_news for update to authenticated using (public.is_authorized());
  exception when duplicate_object then null; end $$;

-- capital_events: fully managed in-app by allowlisted users.
do $$ begin
  create policy "Allowlisted read deals" on public.capital_events for select to authenticated using (public.is_authorized());
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Allowlisted insert deals" on public.capital_events for insert to authenticated with check (public.is_authorized());
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Allowlisted update deals" on public.capital_events for update to authenticated using (public.is_authorized());
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Allowlisted delete deals" on public.capital_events for delete to authenticated using (public.is_authorized());
  exception when duplicate_object then null; end $$;

grant select, update on public.market_news to authenticated;
grant select, insert, update, delete on public.capital_events to authenticated;

-- This project's default privileges do not auto-grant to service_role,
-- and the news cron writes with the secret key (service_role).
grant select, insert, update on public.market_news to service_role;
grant select, insert, update, delete on public.capital_events to service_role;

notify pgrst, 'reload schema';
