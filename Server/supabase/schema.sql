-- ============================================================
-- Sahaay — Supabase schema
--
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New
-- query → paste → Run) against your project, before policies.sql and
-- (optionally) seed.sql. Safe to re-run: every statement is idempotent
-- (IF NOT EXISTS / OR REPLACE / drop-then-create for triggers).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  create type user_role as enum ('donor', 'volunteer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('ongoing', 'upcoming', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('under_review', 'approved', 'rejected', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type donation_status as enum ('allocated', 'used');
exception when duplicate_object then null; end $$;

do $$ begin
  create type beneficiary_progress as enum ('on_track', 'needs_support');
exception when duplicate_object then null; end $$;


-- ---------- 1. profiles ----------
-- One row per Supabase Auth user, created automatically by the
-- handle_new_user trigger below the first time someone signs up.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'donor',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 4. programs ----------
-- Declared before beneficiaries/events/donations, which reference it.
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 2. volunteers ----------
-- 1:1 extension of profiles for role = 'volunteer'. Skills/qualification/
-- availability/location are self-reported; stats (events attended, hours,
-- match scores) are DERIVED from applications/attendance below, not stored
-- here, so a dashboard number can never drift out of sync with reality.
create table if not exists volunteers (
  id uuid primary key references profiles (id) on delete cascade,
  skills text[] not null default '{}',
  qualification text,
  availability text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 3. beneficiaries ----------
-- Child/orphan records. full_name is PII and is locked down hard by RLS in
-- policies.sql — Staff's "operational view" reads everything except it,
-- matching the product's own "personal details restricted to Administrators"
-- language.
create table if not exists beneficiaries (
  id uuid primary key default gen_random_uuid(),
  child_code text not null unique,
  full_name text,
  age_group text,
  program_id uuid references programs (id) on delete set null,
  attendance_pct numeric(5, 2) not null default 0,
  progress beneficiary_progress not null default 'on_track',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 5. events ----------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs (id) on delete set null,
  title text not null,
  description text,
  status event_status not null default 'upcoming',
  event_date date,
  location text,
  volunteers_needed int not null default 0,
  expected_impact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 6. applications ----------
-- A volunteer applying to an event, with a computed match score.
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references volunteers (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,
  match_score numeric(5, 2),
  status application_status not null default 'under_review',
  applied_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (volunteer_id, event_id)
);

-- ---------- 7. attendance ----------
-- One row per volunteer/event pairing once it has happened. Every stat on
-- the Volunteer dashboard (total events, attendance %, hours) is aggregated
-- from this table — see the volunteer_stats view below — nothing is
-- double-stored.
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications (id) on delete cascade,
  volunteer_id uuid not null references volunteers (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,
  attended boolean not null default false,
  hours numeric(6, 2) not null default 0,
  recorded_at timestamptz not null default now(),
  unique (volunteer_id, event_id)
);

-- ---------- 8. donations ----------
-- outcome/impact_note back BOTH the donor "impact flow" screen and the
-- admin "Add Impact Record" form — they read and write the same row.
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references profiles (id) on delete set null,
  program_id uuid references programs (id) on delete set null,
  event_id uuid references events (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  status donation_status not null default 'allocated',
  outcome text,
  impact_note text,
  donated_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists idx_beneficiaries_program on beneficiaries (program_id);
create index if not exists idx_events_program on events (program_id);
create index if not exists idx_events_status on events (status);
create index if not exists idx_applications_volunteer on applications (volunteer_id);
create index if not exists idx_applications_event on applications (event_id);
create index if not exists idx_applications_status on applications (status);
create index if not exists idx_attendance_volunteer on attendance (volunteer_id);
create index if not exists idx_donations_donor on donations (donor_id);
create index if not exists idx_donations_program on donations (program_id);

-- ---------- updated_at maintenance ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_volunteers_updated_at on volunteers;
create trigger trg_volunteers_updated_at before update on volunteers
  for each row execute function set_updated_at();

drop trigger if exists trg_programs_updated_at on programs;
create trigger trg_programs_updated_at before update on programs
  for each row execute function set_updated_at();

drop trigger if exists trg_beneficiaries_updated_at on beneficiaries;
create trigger trg_beneficiaries_updated_at before update on beneficiaries
  for each row execute function set_updated_at();

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();


-- ---------- auto-create a profile on signup ----------
-- Supabase Auth writes new users straight to auth.users; this trigger is
-- what turns that into an app-visible profiles row (and a volunteers row
-- too, if they signed up as a volunteer). role/full_name are read from the
-- signup call's user_metadata — see POST /api/auth/signup in the backend.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  chosen_role user_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'donor');
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', chosen_role);

  if chosen_role = 'volunteer' then
    insert into public.volunteers (id) values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ---------- views: the aggregates the API reads ----------

-- Per-volunteer stats shown on the Volunteer dashboard.
create or replace view volunteer_stats as
select
  v.id as volunteer_id,
  count(distinct a.event_id) as total_events,
  count(distinct a.event_id) filter (where a.attended) as events_attended,
  case when count(distinct a.event_id) = 0 then 0
       else round(100.0 * count(distinct a.event_id) filter (where a.attended)
                  / count(distinct a.event_id), 0)
  end as attendance_pct,
  coalesce(sum(a.hours), 0) as volunteer_hours
from volunteers v
left join attendance a on a.volunteer_id = v.id
group by v.id;

-- Org-wide counts shown on the Admin dashboard.
create or replace view org_overview as
select
  (select coalesce(sum(amount), 0) from donations) as total_donations,
  (select count(*) from profiles where role = 'volunteer') as total_volunteers,
  (select count(*) from beneficiaries) as total_children,
  (select count(*) from programs where is_active) as active_programs,
  (select count(*) from events where status = 'ongoing') as ongoing_events,
  (select count(*) from events where status = 'upcoming') as upcoming_events,
  (select count(*) from events where status = 'completed') as completed_events,
  -- "Students impacted": beneficiaries in a program that has at least one
  -- donation already marked `used` — i.e. a program whose funding has
  -- actually been put to work, not just pledged.
  (select count(distinct b.id)
     from beneficiaries b
     join donations d on d.program_id = b.program_id and d.status = 'used') as students_impacted,
  (select count(*) from applications where status = 'under_review') as pending_applications;

-- Public marketing-site stats (About section's 4 numbers).
create or replace view public_impact_stats as
select
  (select count(*) from beneficiaries) as children_supported,
  (select count(*) from programs) as programs,
  (select count(*) from profiles where role = 'volunteer') as volunteers;

-- Public marketing-site impact breakdown (the 6-tile grid).
create or replace view public_impact_breakdown as
select 'Education' as kicker,
       (select count(*) from beneficiaries b join programs p on p.id = b.program_id
          where p.category = 'Education') as value,
       'Children in Education Initiatives' as body
union all
select 'Healthcare',
       (select count(*) from beneficiaries b join programs p on p.id = b.program_id
          where p.category = 'Healthcare'),
       'Children in Healthcare Initiatives'
union all
select 'Programs',
       (select count(*) from programs where not is_active),
       'Programs Completed'
union all
select 'Volunteering',
       (select coalesce(sum(hours), 0) from attendance),
       'Volunteer Hours Logged'
union all
select 'Events',
       (select count(*) from events where status = 'completed'),
       'Events Conducted'
union all
select 'Reach',
       (select count(*) from beneficiaries),
       'Children Supported Overall';
