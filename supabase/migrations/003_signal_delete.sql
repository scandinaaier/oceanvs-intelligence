-- ============================================================
-- SIGNAL HARD-DELETE — run this in Supabase SQL Editor
-- after 002_campsite_pipeline.sql
-- Adds the policy + grant required for the Signal Log delete button.
-- ============================================================

create policy "Authenticated users can delete signals"
  on public.team_signals for delete
  to authenticated
  using (true);

grant delete on public.team_signals to authenticated;
