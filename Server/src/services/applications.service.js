import { supabaseAdmin } from '../config/supabase.js';

export async function listApplicationsForVolunteer(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, match_score, status, applied_at, events(title)')
    .eq('volunteer_id', volunteerId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAppliedEventIds(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('event_id')
    .eq('volunteer_id', volunteerId);
  if (error) throw error;
  return new Set((data || []).map((r) => r.event_id));
}

export async function createApplication(volunteerId, eventId, matchScore) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({ volunteer_id: volunteerId, event_id: eventId, match_score: matchScore })
    .select('id, match_score, status, applied_at, events(title)')
    .single();
  if (error) throw error;
  return data;
}

// The Staff "assignment queue": volunteers who've applied and are still
// under review, ranked by match score, for a given event.
export async function listAssignmentQueue(eventId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, match_score, status, volunteers(skills, availability, profiles(full_name))')
    .eq('event_id', eventId)
    .eq('status', 'under_review')
    .order('match_score', { ascending: false });
  if (error) throw error;
  return data;
}

// The full Staff "Assignments" page: pending applications across EVERY
// event, not just one — the dashboard's queue only shows the single
// most-in-need event, this shows all of them.
export async function listAllPendingApplications() {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, match_score, status, applied_at, events(id, title), volunteers(skills, availability, profiles(full_name))')
    .eq('status', 'under_review')
    .order('applied_at', { ascending: true });
  if (error) throw error;
  return data;
}

// Approved applications not yet marked in `attendance` — what Staff's
// Attendance page offers to record. A mid-checkin row (checked in via QR,
// not checked out yet) stays "pending" too, rather than vanishing here and
// showing up as a bare 0-hour row in the recorded list — see
// listRecordedAttendance's matching filter below.
export async function listApprovedAwaitingAttendance() {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, events(id, title, event_date), volunteers(id, profiles(full_name)), attendance(id, checked_in_at, checked_out_at)')
    .eq('status', 'approved');
  if (error) throw error;
  return (data || []).filter((r) => {
    const a = r.attendance?.[0];
    return !a || (a.checked_in_at && !a.checked_out_at);
  });
}

// Full detail for a single application — used both by the QR scan
// endpoint (to validate status/event date and identify the volunteer) and
// the post-approval email step (to get the volunteer's contact info).
export async function getApplicationForScan(applicationId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, status, volunteer_id, event_id, volunteers(id, profiles(full_name, email)), events(id, title, event_date)')
    .eq('id', applicationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Everyone actually assigned to this event — status='approved', unlike
// listAssignmentQueue's 'under_review'. Backs the event detail dashboard's
// assigned-volunteers list and the checklist's computed "Volunteers
// assigned" item (approved.length vs. events.volunteers_needed).
export async function listApprovedVolunteersForEvent(eventId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, volunteers(id, skills, availability, profiles(full_name))')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('decided_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function countPending() {
  const { count, error } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'under_review');
  if (error) throw error;
  return count || 0;
}

export async function decideApplication(applicationId, status) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status, decided_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
