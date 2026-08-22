import { supabaseAdmin } from '../config/supabase.js';

export async function recordAttendance(volunteerId, eventId, applicationId, { attended, hours }) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert(
      { volunteer_id: volunteerId, event_id: eventId, application_id: applicationId, attended, hours },
      { onConflict: 'volunteer_id,event_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
