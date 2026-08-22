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

export async function getVolunteerStats(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_stats')
    .select('*')
    .eq('volunteer_id', volunteerId)
    .maybeSingle();
  if (error) throw error;
  return data || { total_events: 0, events_attended: 0, attendance_pct: 0, volunteer_hours: 0 };
}
