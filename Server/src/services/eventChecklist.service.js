import { supabaseAdmin } from '../config/supabase.js';

// Fixed template — every event gets the same 4 manual items. The 5th
// readiness item ("Volunteers assigned") is computed by the controller
// from applications/events data, never stored here.
export const CHECKLIST_ITEMS = [
  { key: 'venue_confirmed', label: 'Venue confirmed' },
  { key: 'budget_approved', label: 'Budget approved' },
  { key: 'materials_arranged', label: 'Materials / supplies arranged' },
  { key: 'invitations_sent', label: 'Invitations / announcements sent' },
];

export async function seedChecklist(eventId) {
  const rows = CHECKLIST_ITEMS.map((i) => ({ event_id: eventId, item_key: i.key }));
  const { error } = await supabaseAdmin.from('event_checklist_items').insert(rows);
  if (error) throw error;
}

export async function listChecklistItems(eventId) {
  const { data, error } = await supabaseAdmin
    .from('event_checklist_items')
    .select('item_key, is_done, completed_at')
    .eq('event_id', eventId);
  if (error) throw error;
  return data;
}

export async function setChecklistItem(eventId, itemKey, isDone, userId) {
  const { data, error } = await supabaseAdmin
    .from('event_checklist_items')
    .update({
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      completed_by: isDone ? userId : null,
    })
    .eq('event_id', eventId)
    .eq('item_key', itemKey)
    .select()
    .single();
  if (error) throw error;
  return data;
}
