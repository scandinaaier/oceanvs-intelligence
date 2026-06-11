-- ============================================================
-- OPTIONAL SECURITY HARDENING — enforce the email allowlist
-- in the database (fixes P1 finding from the 3 June 2026 audit:
-- the documented VITE_AUTHORIZED_EMAILS gate was never enforced).
--
-- After running this, ALSO disable open signups:
--   Supabase Dashboard → Authentication → Sign In / Up →
--   turn OFF "Allow new users to sign up" (or restrict to invites).
--
-- Add/remove team members by inserting/deleting rows in
-- public.authorized_emails.
-- ============================================================

create table if not exists public.authorized_emails (
  email       text primary key,
  added_at    timestamptz default now()
);

insert into public.authorized_emails (email) values
  ('tauriq@oceanvs.com'),
  ('andy@oceanvs.com')
on conflict (email) do nothing;

alter table public.authorized_emails enable row level security;

do $$ begin
  create policy "Authenticated read allowlist" on public.authorized_emails for select to authenticated using (true);
  exception when duplicate_object then null; end $$;

grant select on public.authorized_emails to authenticated;

-- Helper used by every policy below
create or replace function public.is_authorized()
returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.authorized_emails where lower(email) = lower(auth.jwt() ->> 'email')) $$;

-- Tighten the roll-up CRM tables to allowlisted users only.
-- (Extend the same pattern to team_signals / campsite_pipeline /
-- asset_classes when you are ready — kept out of scope here so
-- this migration cannot break the existing live screens.)

drop policy if exists "Authenticated read saunas" on public.rollup_saunas;
drop policy if exists "Authenticated insert saunas" on public.rollup_saunas;
drop policy if exists "Authenticated update saunas" on public.rollup_saunas;
create policy "Allowlisted read saunas" on public.rollup_saunas for select to authenticated using (public.is_authorized());
create policy "Allowlisted insert saunas" on public.rollup_saunas for insert to authenticated with check (public.is_authorized());
create policy "Allowlisted update saunas" on public.rollup_saunas for update to authenticated using (public.is_authorized());

drop policy if exists "Authenticated read campsites reg" on public.rollup_campsites;
drop policy if exists "Authenticated insert campsites reg" on public.rollup_campsites;
drop policy if exists "Authenticated update campsites reg" on public.rollup_campsites;
create policy "Allowlisted read campsites reg" on public.rollup_campsites for select to authenticated using (public.is_authorized());
create policy "Allowlisted insert campsites reg" on public.rollup_campsites for insert to authenticated with check (public.is_authorized());
create policy "Allowlisted update campsites reg" on public.rollup_campsites for update to authenticated using (public.is_authorized());

drop policy if exists "Authenticated read activities" on public.crm_activities;
drop policy if exists "Authenticated insert activities" on public.crm_activities;
create policy "Allowlisted read activities" on public.crm_activities for select to authenticated using (public.is_authorized());
create policy "Allowlisted insert activities" on public.crm_activities for insert to authenticated with check (public.is_authorized());
