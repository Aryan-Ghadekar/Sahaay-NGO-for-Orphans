-- Extended personal-detail fields for beneficiaries — contact/guardian/
-- location/history. Admin-only: the staff-facing query never selects
-- these (see listBeneficiariesOperational in beneficiaries.service.js),
-- same enforcement pattern as full_name masking below.
alter table beneficiaries
  add column if not exists contact_number text,
  add column if not exists guardian_name text,
  add column if not exists address text,
  add column if not exists background_notes text;
