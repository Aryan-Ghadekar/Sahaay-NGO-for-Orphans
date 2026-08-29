import { supabaseAdmin } from '../config/supabase.js';

// Already-recorded attendance, for Staff's Attendance page history section.
export async function listRecordedAttendance() {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, attended, hours, recorded_at, events(title), volunteers(profiles(full_name))')
    .order('recorded_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// A volunteer's own attendance record — for their Attendance page.
export async function listAttendanceForVolunteer(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, attended, hours, recorded_at, events(title, event_date)')
    .eq('volunteer_id', volunteerId)
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

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
