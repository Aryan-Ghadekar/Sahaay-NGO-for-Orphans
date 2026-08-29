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

// The signed-in volunteer's own full record, including the personal-detail
// fields (name, birth date, mobile, address, photo) their own profile page
// edits — same columns admin sees, nothing masked, since this is their own data.
export async function getVolunteerFull(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select('id, first_name, last_name, date_of_birth, mobile_number, address, photo_data_url, skills, qualification, availability, location, profiles(full_name)')
    .eq('id', volunteerId)
    .single();
  if (error) throw error;
  return data;
}

// Admin sees everything, including the account's email and personal details.
export async function listAllVolunteersFull() {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select(
      'id, first_name, last_name, date_of_birth, mobile_number, address, photo_data_url, skills, qualification, availability, location, created_at, profiles(full_name, email)'
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Staff's operational view: never selects email, birth date, mobile
// number, address, or photo — the query-level enforcement of "mask what
// staff doesn't need", not a UI-only omission. full_name stays visible
// since staff genuinely need to know who they're assigning to an event.
export async function listAllVolunteersMasked() {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .select('id, skills, availability, location, profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateVolunteerProfile(volunteerId, {
  firstName, lastName, dateOfBirth, mobileNumber, address, photoDataUrl, skills, qualification, availability, location,
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .update({
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      mobile_number: mobileNumber,
      address,
      photo_data_url: photoDataUrl || null,
      skills,
      qualification,
      availability,
      location,
    })
    .eq('id', volunteerId)
    .select('id, first_name, last_name, date_of_birth, mobile_number, address, photo_data_url, skills, qualification, availability, location')
    .single();
  if (error) throw error;

  // Keep profiles.full_name (used everywhere else — staff assignment
  // queues, donor-facing pages, auth) in sync with the name entered here.
  if (fullName) {
    const { error: profileError } = await supabaseAdmin.from('profiles').update({ full_name: fullName }).eq('id', volunteerId);
    if (profileError) throw profileError;
  }

  return data;
}

export async function getVolunteerStats(volunteerId) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_stats')
    .select('*')
    .eq('volunteer_id', volunteerId)
    .maybeSingle();
  if (error) throw error;
  return data || { total_events: 0, volunteer_hours: 0, certificates_earned: 0 };
}
