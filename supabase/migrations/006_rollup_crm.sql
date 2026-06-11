-- ============================================================
-- ROLL-UP CRM — sauna registry, campsite registry, activity log
-- Run this in the Supabase SQL Editor after 001–005.
-- Idempotent: safe to re-run.
-- ============================================================

-- ── 1. SAUNA OPERATOR REGISTRY ────────────────────────────
-- One row per operating site; sites of the same company share
-- an org_number (e.g. Damp AS runs 7 sites under one entity).

create table if not exists public.rollup_saunas (
  id                  uuid default gen_random_uuid() primary key,
  slug                text unique not null,            -- stable id from research seed
  name                text not null,
  region              text,
  sub_region          text,
  operator_type       text,
  format              text,
  ownership_model     text,
  water_access        text,
  price_range         text,
  booking_model       text,
  year_est            text,
  website             text,
  intel_notes         text,
  is_multi_site       boolean default false,
  locations_count     integer default 1,
  cabins_count        integer,

  -- Brønnøysundregisteret
  org_number          text,
  legal_name          text,
  org_form            text,
  nace                text,
  employees           integer,
  founded             text,
  municipality        text,
  ceo_name            text,
  board               jsonb default '[]'::jsonb,
  owners_count        integer,                         -- board size proxy until manual count
  financials          jsonb default '[]'::jsonb,       -- [{year, revenue_nok, ebit_nok, result_nok, equity_nok, debt_nok}]
  revenue_nok         bigint,                          -- latest filed year (denormalised for filtering)
  revenue_year        integer,
  ebit_nok            bigint,
  yoy_growth_pct      numeric,
  brreg_match         text default 'none' check (brreg_match in ('confirmed', 'high', 'uncertain', 'none')),
  brreg_synced_at     timestamptz,

  -- CRM
  stage               text default 'prospect' check (stage in ('prospect', 'outreach_sent', 'engaged', 'meeting_booked', 'loi', 'acquired', 'passed')),
  priority            text default 'medium' check (priority in ('high', 'medium', 'low')),
  assigned_to         text,
  last_contact_at     timestamptz,
  contact_email       text,
  contact_name        text,
  contact_phone       text,
  contact_source      text,
  estimated_valuation text,
  tags                jsonb default '[]'::jsonb,
  crm_notes           text,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_rollup_saunas_region on public.rollup_saunas(region);
create index if not exists idx_rollup_saunas_stage on public.rollup_saunas(stage);
create index if not exists idx_rollup_saunas_revenue on public.rollup_saunas(revenue_nok desc nulls last);
create index if not exists idx_rollup_saunas_org on public.rollup_saunas(org_number);

-- ── 2. CAMPSITE REGISTRY ──────────────────────────────────
-- Full Nordic landscape (campio.no dataset) + land economics +
-- the same Brreg and CRM layers. Distinct from campsite_pipeline,
-- which tracks for-sale listings scraped from Finn.no.

create table if not exists public.rollup_campsites (
  id                  uuid default gen_random_uuid() primary key,
  source_id           text unique not null,            -- campio.no id
  name                text not null,
  country             text not null,
  county              text,
  address             text,
  lat                 double precision,
  lng                 double precision,
  water_type          text,
  water_name          text,
  nearest_city        text,
  city_dist_km        numeric,
  is_waterfront       boolean default false,
  has_beach           boolean default false,
  has_swimming        boolean default false,
  has_sauna           boolean default false,
  facilities          jsonb default '[]'::jsonb,
  website             text,

  -- Land economics (NOK/m² = asking_price_nok / plot_sqm, computed in app)
  plot_sqm            numeric,
  asking_price_nok    bigint,

  -- Brønnøysundregisteret (same layer as saunas)
  org_number          text,
  legal_name          text,
  org_form            text,
  nace                text,
  employees           integer,
  founded             text,
  municipality        text,
  ceo_name            text,
  board               jsonb default '[]'::jsonb,
  owners_count        integer,
  financials          jsonb default '[]'::jsonb,
  revenue_nok         bigint,
  revenue_year        integer,
  ebit_nok            bigint,
  yoy_growth_pct      numeric,
  brreg_match         text default 'none' check (brreg_match in ('confirmed', 'high', 'uncertain', 'none')),
  brreg_synced_at     timestamptz,

  -- CRM
  stage               text default 'prospect' check (stage in ('prospect', 'outreach_sent', 'engaged', 'meeting_booked', 'loi', 'acquired', 'passed')),
  priority            text default 'medium' check (priority in ('high', 'medium', 'low')),
  assigned_to         text,
  last_contact_at     timestamptz,
  contact_email       text,
  contact_name        text,
  contact_phone       text,
  contact_source      text,
  estimated_valuation text,
  tags                jsonb default '[]'::jsonb,
  crm_notes           text,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_rollup_campsites_country on public.rollup_campsites(country);
create index if not exists idx_rollup_campsites_county on public.rollup_campsites(county);
create index if not exists idx_rollup_campsites_waterfront on public.rollup_campsites(is_waterfront);
create index if not exists idx_rollup_campsites_stage on public.rollup_campsites(stage);

-- ── 3. CRM ACTIVITY LOG ───────────────────────────────────
-- Who contacted whom, when, through which channel.

create table if not exists public.crm_activities (
  id            uuid default gen_random_uuid() primary key,
  target_type   text not null check (target_type in ('sauna', 'campsite')),
  target_id     uuid not null,
  actor         text not null,                         -- email of the team member
  channel       text not null default 'note' check (channel in ('email', 'call', 'meeting', 'note', 'linkedin', 'site_visit')),
  summary       text not null,
  stage_at_time text,
  occurred_at   timestamptz default now(),
  created_at    timestamptz default now()
);

create index if not exists idx_crm_activities_target on public.crm_activities(target_type, target_id);
create index if not exists idx_crm_activities_occurred on public.crm_activities(occurred_at desc);
create index if not exists idx_crm_activities_actor on public.crm_activities(actor);

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────

alter table public.rollup_saunas enable row level security;
alter table public.rollup_campsites enable row level security;
alter table public.crm_activities enable row level security;

do $$ begin
  create policy "Authenticated read saunas" on public.rollup_saunas for select to authenticated using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated insert saunas" on public.rollup_saunas for insert to authenticated with check (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated update saunas" on public.rollup_saunas for update to authenticated using (true);
  exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Authenticated read campsites reg" on public.rollup_campsites for select to authenticated using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated insert campsites reg" on public.rollup_campsites for insert to authenticated with check (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated update campsites reg" on public.rollup_campsites for update to authenticated using (true);
  exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Authenticated read activities" on public.crm_activities for select to authenticated using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated insert activities" on public.crm_activities for insert to authenticated with check (true);
  exception when duplicate_object then null; end $$;

-- ── 5. GRANTS ─────────────────────────────────────────────

grant select, insert, update on public.rollup_saunas to authenticated;
grant select, insert, update on public.rollup_campsites to authenticated;
grant select, insert on public.crm_activities to authenticated;
