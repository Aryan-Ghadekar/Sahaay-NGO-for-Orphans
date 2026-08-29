-- Extended volunteer profile fields — first/last name, birth date, mobile
-- number, address, and a photo — captured the same way beneficiary intake
-- fields were (see 006_beneficiary_pii_fields.sql): admin-only visibility,
-- never selected by the staff-facing masked query in volunteers.service.js.
alter table volunteers
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists mobile_number text,
  add column if not exists address text,
  add column if not exists photo_data_url text;

-- Minimum hours a volunteer must log at an event before they're eligible
-- for a certificate for it. 0 means no minimum — any hours logged qualify.
alter table events
  add column if not exists min_hours_required numeric(6, 2) not null default 0;

-- Replaces the old Present/Absent "attendance" concept: staff/admin log
-- hours worked (attendance table, unchanged shape), and once a volunteer's
-- logged hours for an event meet that event's min_hours_required, staff or
-- admin can issue a certificate — one per volunteer per event.
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references volunteers (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,
  hours numeric(6, 2) not null,
  issued_by uuid references profiles (id) on delete set null,
  issued_at timestamptz not null default now(),
  unique (volunteer_id, event_id)
);

alter table certificates enable row level security;
drop policy if exists "certificates: owner or staff/admin select" on certificates;
create policy "certificates: owner or staff/admin select" on certificates
  for select using (volunteer_id = auth.uid() or auth_role() in ('staff', 'admin'));
drop policy if exists "certificates: staff/admin insert" on certificates;
create policy "certificates: staff/admin insert" on certificates
  for insert with check (auth_role() in ('staff', 'admin'));

-- Attendance % is gone from the volunteer dashboard (replaced by
-- certificates_earned) — this view drops events_attended/attendance_pct
-- and adds the certificate count alongside the existing hours total.
create or replace view volunteer_stats as
select
  v.id as volunteer_id,
  count(distinct a.event_id) as total_events,
  coalesce(sum(a.hours), 0) as volunteer_hours,
  count(distinct c.event_id) as certificates_earned
from volunteers v
left join attendance a on a.volunteer_id = v.id
left join certificates c on c.volunteer_id = v.id
group by v.id;
