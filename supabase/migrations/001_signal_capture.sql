-- ============================================================
-- SIGNAL CAPTURE — complete migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
-- ============================================================

-- ── 1. TABLES ─────────────────────────────────────────────

-- Asset classes lookup (user-extendable via the "+" button, no code change needed)
create table if not exists public.asset_classes (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  created_at  timestamptz default now()
);

-- Team signals — the core capture table
create table if not exists public.team_signals (
  id            uuid default gen_random_uuid() primary key,
  url           text,
  title         text not null,
  description   text,
  asset_class   text not null references public.asset_classes(name),
  city          text,
  vertical      text check (vertical in ('COASTAL_HOTELS', 'PREMIUM_SAUNAS', 'BOTH')),
  thesis_tag    text,
  tip_source    text,
  submitted_by  text not null,
  submitted_at  timestamptz default now(),
  notes         text,
  archived      boolean default false
);

-- ── 2. INDEXES ────────────────────────────────────────────

create index if not exists idx_team_signals_city on public.team_signals(city);
create index if not exists idx_team_signals_asset_class on public.team_signals(asset_class);
create index if not exists idx_team_signals_submitted_at on public.team_signals(submitted_at desc);

-- ── 3. SEED DATA ──────────────────────────────────────────

insert into public.asset_classes (name) values
  ('Boutique Hotel'),
  ('Premium Sauna'),
  ('Camping Ground'),
  ('Waterfront Property')
on conflict (name) do nothing;

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────

alter table public.team_signals enable row level security;
alter table public.asset_classes enable row level security;

-- Policies for team_signals
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

-- Policies for asset_classes
create policy "Authenticated users can read asset classes"
  on public.asset_classes for select
  to authenticated
  using (true);

create policy "Authenticated users can insert asset classes"
  on public.asset_classes for insert
  to authenticated
  with check (true);

-- Allow anon to read asset classes (dropdown may load during auth edge cases)
create policy "Anon can read asset classes"
  on public.asset_classes for select
  to anon
  using (true);

-- ── 5. TABLE-LEVEL GRANTS ─────────────────────────────────
-- RLS controls WHICH rows, but Postgres also needs GRANT to allow access at all.

grant select, insert, update on public.team_signals to authenticated;
grant usage on all sequences in schema public to authenticated;

grant select, insert on public.asset_classes to authenticated;
grant select on public.asset_classes to anon;
