-- First "growing log against one subject" table in this schema — unlike
-- attendance/certificates (one row per volunteer+event pairing), a child
-- can have any number of visits over time, so there's no unique-pairing
-- constraint here, just an append-only history ordered by visit_date.
create table if not exists beneficiary_visits (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references beneficiaries (id) on delete cascade,
  visitor_name text not null,
  relation text not null,
  visit_date date not null,
  notes text,
  logged_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_beneficiary_visits_beneficiary on beneficiary_visits (beneficiary_id);

-- Same blanket policy as beneficiaries itself (schema.sql's own comment
-- there explains why: RLS is row-level, not column-level, so PII/identity
-- restriction is enforced in the service-layer query shape, not here).
alter table beneficiary_visits enable row level security;
drop policy if exists "beneficiary_visits: staff/admin only" on beneficiary_visits;
create policy "beneficiary_visits: staff/admin only" on beneficiary_visits
  for all using (auth_role() in ('staff', 'admin'));
