-- Tracks whether a donation's impact_note was written by the admin or
-- generated via the Gemini impact-narrative feature, so the donor-facing
-- dashboard can label it accordingly.
alter table donations
  add column if not exists impact_ai_generated boolean not null default false;
