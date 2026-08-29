-- Per-event image, shown on the public landing page's event cards instead
-- of the static category-based stock photo once an admin uploads one.
alter table events add column if not exists image_data_url text;

-- Key/value store for the handful of site-wide landing-page images that
-- aren't tied to any single program/event (Hero, Volunteer CTA) — admin
-- uploads a replacement, the public site falls back to its bundled default
-- photo when a key has no image_data_url yet.
create table if not exists site_content (
  key text primary key,
  image_data_url text,
  updated_at timestamptz not null default now()
);

insert into site_content (key) values ('hero_image'), ('volunteer_cta_image')
on conflict (key) do nothing;

-- Same "public marketing content" shape as programs/events — readable by
-- anyone, written only by the backend's service-role key (admin-gated
-- above that).
alter table site_content enable row level security;
drop policy if exists "site_content: public read" on site_content;
create policy "site_content: public read" on site_content for select using (true);

