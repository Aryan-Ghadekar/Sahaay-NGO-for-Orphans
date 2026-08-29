import { supabaseAdmin } from '../config/supabase.js';

// "ArXXXXX" style — first two characters only, rest replaced with a fixed
// run of X's so the mask never leaks the real name's length.
function maskName(fullName) {
  if (!fullName) return '—';
  return `${fullName.slice(0, 2)}XXXXX`;
}

// Operational view: staff see a masked name (e.g. "ArXXXXX") and the
// day-to-day fields, never contact_number/guardian_name/address/
// background_notes — those stay admin-only. Enforced here at the query
// level (the PII columns are never selected, and full_name is masked
// before it ever leaves this function), not left to the frontend to
// withhold.
export async function listBeneficiariesOperational() {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id, child_code, full_name, age_group, attendance_pct, progress, programs(name)')
    .order('child_code');
  if (error) throw error;
  return data.map((r) => ({ ...r, full_name: maskName(r.full_name) }));
}

// Admin-only: the one place full_name and the other personal-detail
// columns (contact, guardian, address, history) are ever selected.
export async function listBeneficiariesFull() {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id, child_code, full_name, age_group, program_id, attendance_pct, progress, contact_number, guardian_name, address, background_notes, programs(name), created_at')
    .order('child_code');
  if (error) throw error;
  return data;
}

// Full CRUD is admin-only (see requireRole('admin') on the admin routes) —
// staff's operational view above stays read-only and PII-free regardless.
export async function createBeneficiary({ childCode, fullName, ageGroup, programId, attendancePct, progress, contactNumber, guardianName, address, backgroundNotes }) {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .insert({
      child_code: childCode,
      full_name: fullName,
      age_group: ageGroup,
      program_id: programId || null,
      attendance_pct: attendancePct || 0,
      progress: progress || 'on_track',
      contact_number: contactNumber || null,
      guardian_name: guardianName || null,
      address: address || null,
      background_notes: backgroundNotes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBeneficiary(id, { childCode, fullName, ageGroup, programId, attendancePct, progress, contactNumber, guardianName, address, backgroundNotes }) {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .update({
      child_code: childCode,
      full_name: fullName,
      age_group: ageGroup,
      program_id: programId || null,
      attendance_pct: attendancePct,
      progress,
      contact_number: contactNumber || null,
      guardian_name: guardianName || null,
      address: address || null,
      background_notes: backgroundNotes || null,
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
