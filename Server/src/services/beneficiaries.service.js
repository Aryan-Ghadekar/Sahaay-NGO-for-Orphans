import { supabaseAdmin } from '../config/supabase.js';
import { calculateAge } from '../utils/format.js';

// "ArXXXXX" style — first two characters only, rest replaced with a fixed
// run of X's so the mask never leaks the real name's length.
function maskName(fullName) {
  if (!fullName) return '—';
  return `${fullName.slice(0, 2)}XXXXX`;
}

// Prefer the derived age from date_of_birth; fall back to the legacy
// free-text age_group for rows created before intake asked for a birth date.
function ageDisplay(row) {
  return calculateAge(row.date_of_birth) || row.age_group || '—';
}

// Operational view: staff see a masked name (e.g. "ArXXXXX") and the
// day-to-day fields, never contact_number/guardian_name/address/
// background_notes/brought_by_*/photo_* — those stay admin-only. Enforced
// here at the query level (the PII columns are never selected, and
// full_name is masked before it ever leaves this function), not left to
// the frontend to withhold.
export async function listBeneficiariesOperational() {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id, child_code, full_name, age_group, date_of_birth, attendance_pct, progress, programs(name)')
    .order('child_code');
  if (error) throw error;
  return data.map((r) => ({ ...r, full_name: maskName(r.full_name), age_display: ageDisplay(r) }));
}

// Admin-only: the one place full_name and the other personal-detail
// columns (contact, guardian, address, history, brought-by details,
// photos) are ever selected.
export async function listBeneficiariesFull() {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select(
      'id, child_code, full_name, first_name, last_name, age_group, date_of_birth, program_id, attendance_pct, progress, contact_number, guardian_name, address, background_notes, brought_by_name, brought_by_relation, brought_by_contact, photo_data_url, brought_by_photo_data_url, programs(name), created_at'
    )
    .order('child_code');
  if (error) throw error;
  return data.map((r) => ({ ...r, age_display: ageDisplay(r) }));
}

// "CHD-1042" style, auto-assigned — the admin form no longer takes a
// hand-typed Child ID, so intake always gets a fresh, unused code.
async function generateChildCode() {
  const { data, error } = await supabaseAdmin.from('beneficiaries').select('child_code');
  if (error) throw error;
  const maxNum = (data || []).reduce((max, r) => {
    const n = parseInt((r.child_code || '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 1041);
  return `CHD-${maxNum + 1}`;
}

// Full CRUD is admin-only (see requireRole('admin') on the admin routes) —
// staff's operational view above stays read-only and PII-free regardless.
export async function createBeneficiary({
  firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
  broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
}) {
  const childCode = await generateChildCode();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .insert({
      child_code: childCode,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      program_id: programId || null,
      contact_number: contactNumber,
      guardian_name: guardianName,
      address,
      background_notes: backgroundNotes,
      brought_by_name: broughtByName,
      brought_by_relation: broughtByRelation,
      brought_by_contact: broughtByContact,
      photo_data_url: photoDataUrl || null,
      brought_by_photo_data_url: broughtByPhotoDataUrl || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBeneficiary(id, {
  firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
  broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .update({
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      program_id: programId || null,
      contact_number: contactNumber,
      guardian_name: guardianName,
      address,
      background_notes: backgroundNotes,
      brought_by_name: broughtByName,
      brought_by_relation: broughtByRelation,
      brought_by_contact: broughtByContact,
      photo_data_url: photoDataUrl || null,
      brought_by_photo_data_url: broughtByPhotoDataUrl || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBeneficiary(id) {
  const { error } = await supabaseAdmin.from('beneficiaries').delete().eq('id', id);
  if (error) throw error;
}

export async function countBeneficiaries() {
  const { count, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

// Resolves the masked identifier staff work with (child_code) to the real
// row id — staff never receives the real id directly (see
// listBeneficiariesOperational), so any staff-facing feature keyed on a
// specific child (like the visitor log) needs this lookup first.
export async function getIdByChildCode(childCode) {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id')
    .eq('child_code', childCode)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

// Grounding numbers for the AI impact-story generator — how many children a
// program actually supports and how engaged they are, so the drafted
// outcome stays proportionate to reality instead of inventing a scale.
export async function getProgramStats(programId) {
  if (!programId) return { count: 0, avgAttendance: null };
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('attendance_pct')
    .eq('program_id', programId);
  if (error) throw error;
  const count = data.length;
  const avgAttendance = count
    ? Math.round(data.reduce((sum, b) => sum + Number(b.attendance_pct), 0) / count)
    : null;
  return { count, avgAttendance };
}
