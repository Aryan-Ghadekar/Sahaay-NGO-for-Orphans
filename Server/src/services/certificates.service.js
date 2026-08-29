import { supabaseAdmin } from '../config/supabase.js';

// A volunteer's own certificates — for their Certificates page.
export async function listCertificatesForVolunteer(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('certificates')
    .select('id, event_id, hours, issued_at')
    .eq('volunteer_id', volunteerId);
  if (error) throw error;
  return data;
}

// Every issued certificate — used by staff's Attendance page to know which
// (volunteer, event) pairs already have one, so it doesn't offer to issue
// a duplicate (the unique constraint would reject it anyway, but the UI
// shouldn't invite the attempt).
export async function listAllCertificates() {
  const { data, error } = await supabaseAdmin.from('certificates').select('volunteer_id, event_id, issued_at');
  if (error) throw error;
  return data;
}

export async function issueCertificate(volunteerId, eventId, hours, issuedBy) {
  const { data, error } = await supabaseAdmin
    .from('certificates')
    .insert({ volunteer_id: volunteerId, event_id: eventId, hours, issued_by: issuedBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}
