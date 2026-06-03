-- ============================================================
-- CAMPSITE PIPELINE — add currency column
-- run this in Supabase SQL Editor after 002_campsite_pipeline.sql
-- ============================================================
--
-- price_nok holds the numeric asking-price amount (column name is legacy — the
-- amount may now be in any currency). `currency` records which currency that
-- amount is in, so the pipeline can display "€250,000" / "SEK 2.5M" / "NOK 20M".
-- Adding the column with a default backfills every existing row to NOK (all
-- existing listings are Finn.no / Norwegian).

alter table public.campsite_pipeline
  add column if not exists currency text not null default 'NOK';
