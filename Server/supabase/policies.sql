-- ============================================================
-- Sahaay — Row Level Security policies
--
-- Run after schema.sql. The Express backend (Server/) talks to Supabase
-- with the SERVICE ROLE key, which bypasses RLS entirely — the real
-- authorization gate for this app is the backend's authenticate +
-- requireRole middleware, not Postgres. These policies exist as
-- defense-in-depth for any OTHER access path (Supabase Studio's table
-- editor, a future direct-from-browser feature using the anon key,
-- someone's personal access token) so a bug or a new feature can't
-- accidentally expose more than intended.
-- ============================================================

alter table profiles enable row level security;
alter table volunteers enable row level security;
alter table beneficiaries enable row level security;
alter table programs enable row level security;
alter table events enable row level security;
alter table applications enable row level security;
alter table attendance enable row level security;
alter table donations enable row level security;

-- Current caller's role, looked up once and reused by every policy below.
-- security definer so it can read `profiles` even though the calling role
-- itself might not have a profiles SELECT policy that covers arbitrary rows.
create or replace function auth_role()
returns user_role
language sql stable
security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- ---------- profiles ----------
drop policy if exists "profiles: self or staff/admin can select" on profiles;
create policy "profiles: self or staff/admin can select" on profiles
  for select using (auth.uid() = id or auth_role() in ('staff', 'admin'));

drop policy if exists "profiles: self can update own" on profiles;
create policy "profiles: self can update own" on profiles
  for update using (auth.uid() = id);

-- role is deliberately NOT settable by the user themself — see the trigger
-- below, which blocks any non-service-role attempt to change it.
create or replace function prevent_role_self_escalation()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role can only be changed by an administrator';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_prevent_role_escalation on profiles;
create trigger trg_prevent_role_escalation before update on profiles
  for each row execute function prevent_role_self_escalation();

-- ---------- volunteers ----------
drop policy if exists "volunteers: owner or staff/admin select" on volunteers;
create policy "volunteers: owner or staff/admin select" on volunteers
  for select using (auth.uid() = id or auth_role() in ('staff', 'admin'));

drop policy if exists "volunteers: owner can update own" on volunteers;
create policy "volunteers: owner can update own" on volunteers
  for update using (auth.uid() = id);

-- ---------- programs / events ----------
-- Public-readable (including anonymous visitors) — the marketing site
-- shows programs and events with no login required.
drop policy if exists "programs: public read" on programs;
create policy "programs: public read" on programs for select using (true);

drop policy if exists "events: public read" on events;
create policy "events: public read" on events for select using (true);

drop policy if exists "programs: staff/admin manage" on programs;
create policy "programs: staff/admin manage" on programs
  for insert with check (auth_role() in ('staff', 'admin'));
drop policy if exists "programs: staff/admin update" on programs;
create policy "programs: staff/admin update" on programs
  for update using (auth_role() in ('staff', 'admin'));
drop policy if exists "programs: staff/admin delete" on programs;
create policy "programs: staff/admin delete" on programs
  for delete using (auth_role() in ('staff', 'admin'));

drop policy if exists "events: staff/admin manage" on events;
create policy "events: staff/admin manage" on events
  for insert with check (auth_role() in ('staff', 'admin'));
drop policy if exists "events: staff/admin update" on events;
create policy "events: staff/admin update" on events
  for update using (auth_role() in ('staff', 'admin'));
drop policy if exists "events: staff/admin delete" on events;
create policy "events: staff/admin delete" on events
  for delete using (auth_role() in ('staff', 'admin'));

-- ---------- beneficiaries ----------
-- Staff/admin only — this table holds children's records. Postgres RLS is
-- row-level, not column-level, so it can't by itself stop staff from
-- reading full_name/contact_number/guardian_name/address/background_notes
-- the way admin can — that distinction is enforced in the backend's
-- staff-facing query (listBeneficiariesOperational masks full_name and
-- never selects the other PII columns at all). This policy is the hard
-- backstop against reading the table with no role check at all.
drop policy if exists "beneficiaries: staff/admin only" on beneficiaries;
create policy "beneficiaries: staff/admin only" on beneficiaries
  for all using (auth_role() in ('staff', 'admin'));

-- ---------- applications ----------
drop policy if exists "applications: owner or staff/admin select" on applications;
create policy "applications: owner or staff/admin select" on applications
  for select using (volunteer_id = auth.uid() or auth_role() in ('staff', 'admin'));

drop policy if exists "applications: volunteer can apply for self" on applications;
create policy "applications: volunteer can apply for self" on applications
  for insert with check (volunteer_id = auth.uid());

drop policy if exists "applications: staff/admin can decide" on applications;
create policy "applications: staff/admin can decide" on applications
  for update using (auth_role() in ('staff', 'admin'));

-- ---------- attendance ----------
drop policy if exists "attendance: owner or staff/admin select" on attendance;
create policy "attendance: owner or staff/admin select" on attendance
  for select using (volunteer_id = auth.uid() or auth_role() in ('staff', 'admin'));

drop policy if exists "attendance: staff/admin manage" on attendance;
create policy "attendance: staff/admin manage" on attendance
  for all using (auth_role() in ('staff', 'admin'));

-- ---------- donations ----------
drop policy if exists "donations: owner or staff/admin select" on donations;
create policy "donations: owner or staff/admin select" on donations
  for select using (donor_id = auth.uid() or auth_role() in ('staff', 'admin'));

drop policy if exists "donations: donor can create own" on donations;
create policy "donations: donor can create own" on donations
  for insert with check (donor_id = auth.uid());

drop policy if exists "donations: staff/admin manage" on donations;
create policy "donations: staff/admin manage" on donations
  for update using (auth_role() in ('staff', 'admin'));
