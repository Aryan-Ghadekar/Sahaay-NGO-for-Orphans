import { supabaseAdmin } from '../config/supabase.js';

// Already-recorded hours, for Staff's Attendance page history section —
// includes each event's certificate threshold so staff can see who's
// eligible at a glance.
export async function listRecordedAttendance() {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, hours, recorded_at, volunteer_id, event_id, events(title, min_hours_required), volunteers(profiles(full_name))')
    .order('recorded_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// A volunteer's own hours log — for their Certificates page.
export async function listAttendanceForVolunteer(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, hours, recorded_at, event_id, events(title, event_date, min_hours_required)')
    .eq('volunteer_id', volunteerId)
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Single (volunteer, event) lookup — used when issuing a certificate, so
// eligibility is re-checked against the actual logged hours regardless of
// how far back the record is (listRecordedAttendance is capped to 50 rows).
export async function getAttendanceRecord(volunteerId, eventId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, hours')
    .eq('volunteer_id', volunteerId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// "attended" is derived from hours (no separate Present/Absent input
// anymore) and kept only because volunteer_stats' total_events count and
// historical rows still reference it — hours is the source of truth.
export async function recordAttendance(volunteerId, eventId, applicationId, hours) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert(
      { volunteer_id: volunteerId, event_id: eventId, application_id: applicationId, attended: hours > 0, hours },
      { onConflict: 'volunteer_id,event_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
