-- ============================================================
-- Sahaay — donation payment-proof support
--
-- Adds what the Donate flow needs: a screenshot of the bank
-- transfer/UPI payment, a donor-entered note, and a `verified` flag staff
-- can flip once they've checked the screenshot against the bank statement.
-- Run this in the SQL Editor after schema.sql/policies.sql/seed.sql — safe
-- to re-run (every statement is IF NOT EXISTS).
--
-- Stores the screenshot as a data: URL directly in the row (same pattern
-- as this project's own image-slot.js component) rather than in Supabase
-- Storage — no bucket to provision, and screenshots are small enough
-- (resized client-side before upload) that Postgres TOAST handles them
-- fine. Move to Storage later if donation volume makes that worth it.
-- ============================================================

alter table donations add column if not exists payment_proof_data_url text;
alter table donations add column if not exists donor_note text;
alter table donations add column if not exists verified boolean not null default false;

create index if not exists idx_donations_verified on donations (verified);
