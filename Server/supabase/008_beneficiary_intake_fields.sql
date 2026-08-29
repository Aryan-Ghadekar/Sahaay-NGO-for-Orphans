-- Intake fields for the "add an orphan record" flow: separate first/last
-- name (instead of one free-text full name), date of birth (age is derived
-- from this, not typed by hand), a photo of the child, and details of the
-- person who physically brought the child to the NGO (a different person
-- from the ongoing guardian/caretaker already captured in guardian_name).
-- Same admin-only PII treatment as the existing contact/guardian/address/
-- background_notes columns (see 006_beneficiary_pii_fields.sql) — never
-- selected by the staff-facing operational query.
alter table beneficiaries
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists brought_by_name text,
  add column if not exists brought_by_relation text,
  add column if not exists brought_by_contact text,
  add column if not exists photo_data_url text,
  add column if not exists brought_by_photo_data_url text;
