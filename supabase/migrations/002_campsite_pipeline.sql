-- ============================================================
-- CAMPSITE PIPELINE — run this in Supabase SQL Editor
-- after 001_signal_capture.sql
-- ============================================================

-- Campsite pipeline — the core acquisition pipeline table
create table if not exists public.campsite_pipeline (
  id            uuid default gen_random_uuid() primary key,
  finnkode      text unique,                                   -- Finn.no listing ID
  url           text,                                          -- direct link to Finn.no listing
  title         text not null,
  description   text,
  price_nok     bigint default 0,
  location      text,                                          -- street address
  region        text,                                          -- Norwegian region (Vestfold, Nordland, etc.)
  images        jsonb default '[]'::jsonb,                     -- array of image URLs
  plot_size     text,
  building_area text,
  property_type text,
  waterfront    boolean default false,                          -- confirmed waterfront access
  pitches       integer,                                       -- number of camping pitches
  status        text default 'new' check (status in ('new', 'watching', 'contacted', 'active', 'passed')),
  notes         text,
  added_by      text,                                          -- email of person who added it
  added_at      timestamptz default now(),
  updated_at    timestamptz default now(),
  scraped_at    timestamptz                                    -- when the listing was scraped
);

-- Indexes
create index if not exists idx_campsite_pipeline_region on public.campsite_pipeline(region);
create index if not exists idx_campsite_pipeline_status on public.campsite_pipeline(status);
create index if not exists idx_campsite_pipeline_added_at on public.campsite_pipeline(added_at desc);

-- Row Level Security
alter table public.campsite_pipeline enable row level security;

create policy "Authenticated users can read campsites"
  on public.campsite_pipeline for select
  to authenticated using (true);

create policy "Authenticated users can insert campsites"
  on public.campsite_pipeline for insert
  to authenticated with check (true);

create policy "Authenticated users can update campsites"
  on public.campsite_pipeline for update
  to authenticated using (true);

-- Table-level grants
grant select, insert, update on public.campsite_pipeline to authenticated;
