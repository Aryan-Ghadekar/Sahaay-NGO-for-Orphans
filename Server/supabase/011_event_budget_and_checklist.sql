-- Budget tracking + a fixed 4-item manual checklist per event. The 5th
-- readiness item ("Volunteers assigned") is never stored — it's computed
-- on read from applications.status='approved' vs. events.volunteers_needed
-- in the controller, so it can never drift out of sync the way a stored/
-- toggled boolean could if a future write path forgot to update it.
alter table events
  add column if not exists budget_amount numeric(12, 2) not null default 0;

create table if not exists event_checklist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  item_key text not null check (item_key in ('venue_confirmed', 'budget_approved', 'materials_arranged', 'invitations_sent')),
  is_done boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, item_key)
);
create index if not exists idx_event_checklist_items_event on event_checklist_items (event_id);

-- Backfill: pre-existing events need their 4 rows too — app-level seeding
-- (admin.controller.js's createEvent) only covers events created after
-- this migration runs. Safe to re-run thanks to the unique constraint.
insert into event_checklist_items (event_id, item_key)
select e.id, k.item_key
from events e
cross join (values ('venue_confirmed'), ('budget_approved'), ('materials_arranged'), ('invitations_sent')) as k(item_key)
on conflict (event_id, item_key) do nothing;

alter table event_checklist_items enable row level security;
drop policy if exists "event_checklist_items: staff/admin only" on event_checklist_items;
create policy "event_checklist_items: staff/admin only" on event_checklist_items
  for all using (auth_role() in ('staff', 'admin'));
