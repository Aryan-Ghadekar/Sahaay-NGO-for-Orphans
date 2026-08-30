import { supabaseAdmin } from '../config/supabase.js';

export async function listEventsByStatus(status) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, description, status, event_date, location, volunteers_needed, expected_impact, image_data_url, min_hours_required, programs(name, category)')
    .eq('status', status)
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function listUpcomingEventsRaw() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, description, event_date, location, volunteers_needed, programs(category)')
    .eq('status', 'upcoming');
  if (error) throw error;
  return data;
}

export async function countEventsByStatus(status) {
  const { count, error } = await supabaseAdmin
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);
  if (error) throw error;
  return count || 0;
}

export async function listAllEvents() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, description, status, event_date, location, volunteers_needed, expected_impact, image_data_url, min_hours_required, programs(name, category)')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createEvent({ title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl, minHoursRequired }) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
      title,
      description,
      program_id: programId || null,
      status: status || 'upcoming',
      event_date: eventDate || null,
      location,
      volunteers_needed: volunteersNeeded || 0,
      expected_impact: expectedImpact || null,
      image_data_url: imageDataUrl || null,
      min_hours_required: minHoursRequired || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, { title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl, minHoursRequired }) {
  const update = {
    title,
    description,
    program_id: programId || null,
    status,
    event_date: eventDate || null,
    location,
    volunteers_needed: volunteersNeeded,
    expected_impact: expectedImpact || null,
    min_hours_required: minHoursRequired || 0,
  };
  // Only touch the image if a fresh one was actually uploaded — an omitted
  // field means "leave the existing image alone", not "clear it".
  if (imageDataUrl !== undefined) update.image_data_url = imageDataUrl || null;

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// applications/attendance reference event_id `on delete cascade` (see
// schema.sql) — deleting an event also removes every application and
// attendance record tied to it. The frontend confirms this explicitly
// before calling delete.
export async function deleteEvent(id) {
  const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function getEventById(id) {
  // The category join keeps scoreMatch's skill corpus (title+description+
  // category) consistent between what a volunteer saw before applying and
  // what apply() persists to applications.match_score.
  const { data, error } = await supabaseAdmin.from('events').select('*, programs(category)').eq('id', id).single();
  if (error) throw error;
  return data;
}
