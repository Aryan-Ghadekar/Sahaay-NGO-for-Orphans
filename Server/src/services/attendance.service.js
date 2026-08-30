import { supabaseAdmin } from '../config/supabase.js';

// Already-recorded hours, for Staff's Attendance page history section —
// includes each event's certificate threshold so staff can see who's
// eligible at a glance. A mid-checkin row (checked in via QR, not checked
// out yet) is filtered out here — it belongs in the "awaiting" list (see
// listApprovedAwaitingAttendance's matching filter) until it either gets a
// checkout scan or a manual override, not shown as a bare 0-hour row here.
export async function listRecordedAttendance() {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, hours, recorded_at, checked_in_at, checked_out_at, volunteer_id, event_id, events(title, min_hours_required), volunteers(profiles(full_name))')
    .order('recorded_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).filter((r) => !(r.checked_in_at && !r.checked_out_at));
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

// Single (volunteer, event) lookup — used both when issuing a certificate
// (eligibility is re-checked against the actual logged hours regardless of
// how far back the record is, since listRecordedAttendance is capped to 50
// rows) and by the QR scan endpoint (to tell whether a scan is a check-in
// or a check-out). volunteer_id+event_id is this table's real identity
// (its unique constraint), not application_id — application_id is
// nullable and a manually-entered row may not have one at all.
export async function getAttendanceRecord(volunteerId, eventId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('id, hours, checked_in_at, checked_out_at')
    .eq('volunteer_id', volunteerId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// "attended" is derived from hours (no separate Present/Absent input
// anymore) and kept only because volunteer_stats' total_events count and
// historical rows still reference it — hours is the source of truth.
// Explicitly nulls out checked_in_at/checked_out_at: a manual entry is
// staff deliberately closing out this record, so any later re-scan of the
// volunteer's QR should start a clean new check-in rather than being
// misread as a checkout against a stale check-in timestamp.
export async function recordAttendance(volunteerId, eventId, applicationId, hours) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert(
      {
        volunteer_id: volunteerId,
        event_id: eventId,
        application_id: applicationId,
        attended: hours > 0,
        hours,
        checked_in_at: null,
        checked_out_at: null,
      },
      { onConflict: 'volunteer_id,event_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// First scan of a volunteer's QR at the venue — records arrival. Upserts
// so a fresh check-in after a manually-closed-out record (see
// recordAttendance above) or after a prior completed check-in/out pair
// cleanly starts over rather than colliding with old data.
export async function checkIn(volunteerId, eventId, applicationId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert(
      { volunteer_id: volunteerId, event_id: eventId, application_id: applicationId, checked_in_at: new Date().toISOString() },
      { onConflict: 'volunteer_id,event_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Second scan — records departure and computes hours from the timestamp
// diff, writing into the same `hours` column every eligibility/certificate
// check already reads.
export async function checkOut(volunteerId, eventId, checkedInAtIso) {
  const checkedOutAt = new Date();
  const hours = Math.max(0, Math.round(((checkedOutAt.getTime() - new Date(checkedInAtIso).getTime()) / 3600000) * 100) / 100);
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .update({ checked_out_at: checkedOutAt.toISOString(), hours, attended: hours > 0 })
    .eq('volunteer_id', volunteerId)
    .eq('event_id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
