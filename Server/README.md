# Sahaay — Server

Express API backing the `Client/` React app, using Supabase as the
Postgres database and auth provider. The backend talks to Supabase with
the **service-role key** and enforces every authorization rule itself
(`authenticate` + `requireRole` middleware) — Supabase Row Level Security
is enabled too, as defense-in-depth, but it isn't what this app relies on.

## 1. Set up the database

In your Supabase project's dashboard → **SQL Editor** → New query, run
these files **in order**, pasting each one's contents and clicking Run
(the confirmation dialog it shows — "Run and enable RLS" — is the right
choice; see the note at the bottom of this section):

1. `supabase/schema.sql` — tables, enums, triggers, views
2. `supabase/policies.sql` — Row Level Security policies
3. `supabase/seed.sql` — sample programs/events/beneficiaries (optional,
   but the app looks a lot more like a real product with it than without)
4. `supabase/004_donation_payment_proof.sql` — adds the columns the Donate
   flow's payment-screenshot upload needs
5. `supabase/005_donation_impact_ai.sql` — adds the column that flags
   whether a donation's impact note was AI-generated
6. `supabase/006_beneficiary_pii_fields.sql` — adds contact/guardian/
   address/history columns to beneficiaries (admin-only; staff never see
   these)
7. `supabase/007_site_images.sql` — per-event and site-wide landing-page
   images
8. `supabase/008_beneficiary_intake_fields.sql` — adds first/last name,
   date of birth, photo, and brought-by-person columns to beneficiaries
9. `supabase/009_volunteer_profile_and_certificates.sql` — adds first/last
   name, date of birth, mobile number, address, and photo columns to
   volunteers; adds `min_hours_required` to events; adds the `certificates`
   table and redefines `volunteer_stats` (attendance % is replaced by a
   certificates-earned count)
10. `supabase/010_qr_checkin.sql` — adds `checked_in_at`/`checked_out_at`
    columns to `attendance`, for QR-based check-in/check-out (see "Email
    and QR check-in" below)

All ten are safe to re-run if you need to.

> Supabase's SQL editor flags `schema.sql` for creating tables without RLS
> enabled and offers "Run and enable RLS" — take that option. It costs
> nothing (the backend uses the service-role key, which bypasses RLS
> either way) and closes the gap immediately instead of leaving tables
> open to the `anon`/`authenticated` keys until `policies.sql` runs next.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in from your Supabase project's **Settings → API** page:
- `SUPABASE_URL` — Project URL
- `SUPABASE_ANON_KEY` — the `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` `secret` key (never
  expose this to the frontend or commit it)
- `GEMINI_API_KEY` — optional, from [Google AI Studio](https://aistudio.google.com/apikey).
  Powers the admin's "✨ Generate with AI" button on the Impact Record form,
  which drafts a donor-facing impact sentence from the outcome the admin
  typed. Leave blank to disable — the rest of the app works fine without it.

## 3. Run it

```bash
npm install
npm run dev     # http://localhost:4000, restarts on file changes
```

`GET /health` returns `{"ok":true}` without touching Supabase — a quick 
way to confirm the server itself is up before debugging anything else.

## 4. Create your first accounts

- **Donor or volunteer**: sign up through the app (`Client`'s `/signup`
  page) — self-service signup only allows those two roles by design.
- **Staff or admin**: these aren't self-service (see `SELF_SERVICE_ROLES`
  in `src/services/auth.service.js`). Once you have at least one admin,
  they create every other staff/admin account from the Admin dashboard's
  Team panel (`POST /api/admin/team`) — no SQL needed for that.

That leaves a bootstrapping problem for your **very first** admin, since
no admin exists yet to create one. One-time fix: sign up through the app
as a donor or volunteer, then promote that account in the SQL Editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

The trigger that creates a `volunteers` row only fires at signup time for
role `volunteer`, so promoting an existing account to `staff`/`admin`
needs no extra row — promoting one **to** `volunteer` does; insert one
manually if you ever need that direction:
```sql
insert into volunteers (id) values ('paste-the-user-id-here');
```

## API surface

Every route below (except `/api/auth/*` and `/api/public/*`) requires
`Authorization: Bearer <token>` — the `token` returned by
`POST /api/auth/login`.

| Method & path | Role | |
|---|---|---|
| `POST /api/auth/signup` | — | donor/volunteer self-signup |
| `POST /api/auth/login` | — | returns `{ token, user }` |
| `POST /api/auth/logout` | — | no-op; frontend just drops the token |
| `GET /api/auth/me` | any | current user's profile |
| `GET /api/public/impact-stats` | — | About section's 4 stats |
| `GET /api/public/impact-breakdown` | — | Impact section's 6 tiles |
| `GET /api/public/events` | — | ongoing + upcoming events |
| `GET /api/public/programs` | — | active programs, for the Donate form's dropdown |
| `GET /api/donor/summary` | donor | totals for the dashboard header |
| `GET /api/donor/donations` | donor | donation history table |
| `GET /api/donor/impact-flow` | donor | latest annotated donation's flow |
| `POST /api/donor/donations` | donor | record a donation (with payment screenshot) |
| `GET /api/volunteer/profile` | volunteer | profile + stats |
| `GET /api/volunteer/recommended` | volunteer | best-match open event |
| `GET /api/volunteer/applications` | volunteer | application history |
| `POST /api/volunteer/applications` | volunteer | apply to an event |
| `GET /api/staff/overview` | staff, admin | org stat row |
| `GET /api/staff/assignments/queue` | staff, admin | pending applicants for an event |
| `POST /api/staff/assignments` | staff, admin | approve an application (also fires the approval QR email) |
| `GET /api/staff/attendance` | staff, admin | hours-awaiting/recorded queue |
| `POST /api/staff/attendance` | staff, admin | manually set a volunteer's hours (override) |
| `POST /api/staff/scan` | staff, admin | scan a volunteer's QR — check-in on first scan, check-out on second |
| `POST /api/staff/certificates` | staff, admin | issue a certificate once hours meet the event's minimum |
| `GET /api/staff/orphans` | staff, admin | beneficiaries, operational view (no PII) |
| `GET /api/admin/overview` | admin | 9-tile org overview |
| `GET /api/admin/content-blocks` | admin | static stub — no CMS table exists yet |
| `GET /api/admin/impact-records/draft` | admin | oldest un-annotated donation |
| `POST /api/admin/impact-records` | admin | attach outcome/impact to a donation |
| `GET /api/admin/team` | admin | list staff + admin accounts |
| `POST /api/admin/team` | admin | create a new staff or admin account |

## Notes

- **Payment proof screenshots are stored as `data:` URLs**, not in
  Supabase Storage — same pattern as this project's `image-slot.js`
  component. Simpler to run (no bucket to provision) and fine at small
  scale; move to Storage if donation volume ever makes the row size worth
  optimizing. `donations.verified` starts `false` on every donation; a
  staff/admin flips it once they've checked the screenshot.
- **`content-blocks` is a stub.** Editing the public site's hero text,
  mission statement, etc. isn't backed by any of the 8 core tables — it
  would need its own `content_blocks` (or full CMS) table. Left as a
  static list so the panel still renders.
- **Matching combines three real signals** — see `src/utils/matching.js`.
  Skills (keyword overlap against the event's title/description/program
  category), availability (the event date's weekday/weekend vs. the
  volunteer's preference), and location (string match). Any factor with no
  usable data on either side is excluded from the average rather than
  scored as 0. Every caller goes through `scoreMatch()`.
- **Email and QR check-in**: approving a volunteer's application
  (`POST /api/staff/assignments`) emails them a QR code encoding their
  `applications.id` — no separate token table. NGO staff scan it with
  `POST /api/staff/scan`: first scan checks in, second checks out, and
  hours are computed from the timestamp diff (`attendance.checked_in_at`/
  `checked_out_at`). Staff can still set hours by hand via
  `POST /api/staff/attendance` as a fallback; doing so resets any
  in-progress check-in so a later stray scan can't overwrite a manual
  correction with stale timestamps. Email sending needs `SMTP_HOST` (and
  friends) set in `.env` — see `.env.example`; with it unset, `assign()`
  still works normally and just logs a warning instead of sending.
  Check-in/check-out is only accepted on the event's actual calendar day
  (`Asia/Kolkata`).
- **"Students Impacted"** (admin overview) is defined as beneficiaries in a
  program that has at least one donation already marked `used` — i.e.
  funding actually put to work, not just pledged. See the comment on
  `org_overview` in `schema.sql` if that definition should change.
