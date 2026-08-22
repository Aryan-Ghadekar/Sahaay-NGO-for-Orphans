-- ============================================================
-- Sahaay — sample data
--
-- Run after schema.sql + policies.sql if you want the app to show
-- something real immediately. Only seeds tables that don't depend on a
-- real Supabase Auth user (programs, events, beneficiaries) — profiles,
-- volunteers, applications, attendance, and donations all need a genuine
-- auth.users row behind them, which only exists once someone actually
-- signs up (see Server/README.md for how to create your first admin).
--
-- Safe to re-run: `on conflict do nothing` skips rows that already exist.
-- ============================================================

insert into programs (name, category, description, is_active) values
  ('Education Support', 'Education', 'Educational support and learning resources for children.', true),
  ('Healthcare Program', 'Healthcare', 'Health check-ups and ongoing care for supported children.', true),
  ('Digital Literacy', 'Education', 'Foundational computer skills for teenagers in the program.', true),
  ('Community Outreach', 'Community', 'Mentoring, sports, and creative activities with volunteers.', false)
on conflict do nothing;

insert into events (program_id, title, description, status, event_date, location, volunteers_needed, expected_impact)
select p.id, v.title, v.description, v.status::event_status, v.event_date::date, v.location, v.volunteers_needed, v.expected_impact
from (values
  ('Education Support', 'Education Support Program', 'Providing educational support and learning resources to children.', 'ongoing', '2026-08-01', 'Pune Center', 6, null),
  ('Digital Literacy', 'Digital Literacy Drive', 'Teaching foundational computer skills to teenagers in the program.', 'ongoing', '2026-08-05', 'Nashik Center', 4, null),
  ('Healthcare Program', 'Health Camp for Children', 'Free health check-ups and vaccination drive for supported children.', 'upcoming', '2026-09-12', 'Mumbai Center', 8, '300 children screened'),
  ('Community Outreach', 'Community Volunteer Day', 'A day of mentoring, sports and creative activities with volunteers.', 'upcoming', '2026-09-20', 'Pune Center', 5, '80 volunteers engaged'),
  ('Education Support', 'Mathematics Support', 'Weekday mathematics tutoring for students falling behind grade level.', 'upcoming', '2026-09-08', 'Pune Center', 4, null)
) as v(program_name, title, description, status, event_date, location, volunteers_needed, expected_impact)
join programs p on p.name = v.program_name
on conflict do nothing;

insert into beneficiaries (child_code, age_group, program_id, attendance_pct, progress)
select v.child_code, v.age_group, p.id, v.attendance_pct, v.progress::beneficiary_progress
from (values
  ('CHD-1042', '13–15', 'Education Support', 92, 'on_track'),
  ('CHD-1078', '9–12', 'Healthcare Program', 85, 'on_track'),
  ('CHD-1103', '13–15', 'Education Support', 70, 'needs_support')
) as v(child_code, age_group, program_name, attendance_pct, progress)
join programs p on p.name = v.program_name
on conflict (child_code) do nothing;
