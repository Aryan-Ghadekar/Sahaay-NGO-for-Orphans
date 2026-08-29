import { supabaseAdmin } from '../config/supabase.js';

export async function getVolunteerWithProfile(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select('id, skills, qualification, availability, location, profiles(full_name)')
    .eq('id', volunteerId)
    .single();
  if (error) throw error;
  return data;
}

// Admin sees everything, including the account's email.
export async function listAllVolunteersFull() {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select('id, skills, qualification, availability, location, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Staff's operational view: never selects email — this is the query-level
// enforcement of "mask what staff doesn't need", not a UI-only omission.
// full_name stays visible since staff genuinely need to know who they're
// assigning to an event.
export async function listAllVolunteersMasked() {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select('id, skills, availability, location, profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateVolunteerProfile(volunteerId, { skills, qualification, availability, location }) {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .update({ skills, qualification, availability, location })
    .eq('id', volunteerId)
    .select('id, skills, qualification, availability, location')
    .single();
  if (error) throw error;
  return data;
}

export async function getVolunteerStats(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_stats')
    .select('*')
    .eq('volunteer_id', volunteerId)
    .maybeSingle();
  if (error) throw error;
  return data || { total_events: 0, events_attended: 0, attendance_pct: 0, volunteer_hours: 0 };
}
