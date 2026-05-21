-- ============================================================
-- SIGNAL CAPTURE — run this in Supabase SQL Editor
-- ============================================================

-- 1. Asset classes lookup (user-extendable, no code change needed)
create table if not exists public.asset_classes (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  created_at  timestamptz default now()
);

-- Seed initial asset classes
insert into public.asset_classes (name) values
  ('Boutique Hotel'),
  ('Waterfront Property'),
  ('Private Villa'),
  ('Camping Ground'),
  ('Premium Sauna'),
  ('Mixed-Use')
on conflict (name) do nothing;

-- 2. Team signals — the core capture table
create table if not exists public.team_signals (
  id            uuid default gen_random_uuid() primary key,
  url           text,                                        -- optional link to listing / article / advert
  title         text not null,                               -- headline the user enters or OG-scraped
  description   text,                                        -- freeform notes / paste of relevant excerpt
  asset_class   text not null references public.asset_classes(name),
  city          text,                                        -- nullable: not every signal maps to a tracked city
  vertical      text check (vertical in ('COASTAL_HOTELS', 'PREMIUM_SAUNAS', 'BOTH')),
  thesis_tag    text,                                        -- e.g. 'undervalued_coastal', 'consolidation_play'
  tip_source    text,                                        -- free text: 'Finn.no', 'broker call', 'Andy tip'
  submitted_by  text not null,                               -- email of submitter (from auth)
  submitted_at  timestamptz default now(),
  notes         text,                                        -- additional internal context
  archived      boolean default false
);

-- Index for common queries
create index if not exists idx_team_signals_city on public.team_signals(city);
create index if not exists idx_team_signals_asset_class on public.team_signals(asset_class);
create index if not exists idx_team_signals_submitted_at on public.team_signals(submitted_at desc);

-- 3. Row Level Security — only authenticated users can read/write
alter table public.team_signals enable row level security;
alter table public.asset_classes enable row level security;

-- Allow authenticated users full access (tiny 2-person team, no per-user isolation needed)
create policy "Authenticated users can read signals"
  on public.team_signals for select
  to authenticated
  using (true);

create policy "Authenticated users can insert signals"
  on public.team_signals for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update signals"
  on public.team_signals for update
  to authenticated
  using (true);

create policy "Authenticated users can read asset classes"
  on public.asset_classes for select
  to authenticated
  using (true);

-- Allow authenticated users to add new asset classes from the UI
create policy "Authenticated users can insert asset classes"
  on public.asset_classes for insert
  to authenticated
  with check (true);
