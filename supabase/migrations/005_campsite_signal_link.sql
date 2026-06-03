-- ============================================================
-- LINK CAMPSITE PIPELINE -> SIGNAL  (run in Supabase SQL Editor
-- after 004_campsite_currency.sql)
-- ============================================================
--
-- A campsite listing is created by dual-writing from a team_signal. This adds the
-- link so that deleting the signal also deletes its campsite (ON DELETE CASCADE).
-- The cascade is a referential action, so it runs regardless of RLS — no separate
-- delete policy on campsite_pipeline is required.

-- 1) Link column
alter table public.campsite_pipeline
  add column if not exists signal_id uuid;

-- 2) Foreign key with cascade delete (idempotent)
alter table public.campsite_pipeline
  drop constraint if exists campsite_pipeline_signal_id_fkey;
alter table public.campsite_pipeline
  add constraint campsite_pipeline_signal_id_fkey
  foreign key (signal_id) references public.team_signals(id) on delete cascade;

create index if not exists idx_campsite_pipeline_signal_id
  on public.campsite_pipeline(signal_id);

-- 3) Best-effort backfill for rows created before the link existed: match a
--    campsite to its signal by URL, but only when that URL maps to exactly one
--    signal (so we never guess and link the wrong one).
update public.campsite_pipeline c
set signal_id = s.id
from public.team_signals s
where c.signal_id is null
  and c.url is not null
  and c.url = s.url
  and (select count(*) from public.team_signals s2 where s2.url = c.url) = 1;

-- 4) Make PostgREST pick up the new column immediately (avoids stale-cache inserts)
notify pgrst, 'reload schema';
