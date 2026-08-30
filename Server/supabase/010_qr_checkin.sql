-- QR-based check-in/check-out: staff scan a volunteer's QR (which just
-- encodes their applications.id — already a random, unguessable,
-- immutable UUID, so no separate token column is needed) once at entry
-- and once at exit. `hours` stays the single source of truth every
-- existing eligibility/certificate feature already reads — checkout just
-- computes it from the timestamp diff.
alter table attendance
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_out_at timestamptz;
