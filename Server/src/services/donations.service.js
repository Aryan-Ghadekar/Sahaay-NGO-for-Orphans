import { supabaseAdmin } from '../config/supabase.js';

export async function listDonationsForDonor(donorId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, status, donated_at, programs(name)')
    .eq('donor_id', donorId)
    .order('donated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDonorSummary(donorId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('amount, program_id, status')
    .eq('donor_id', donorId);
  if (error) throw error;
  const rows = data || [];
  const programs = new Set(rows.map((r) => r.program_id).filter(Boolean));

  // Same definition as org_overview's students_impacted, scoped to this
  // donor: beneficiaries in a program they've funded that's actually been
  // put to use, not just pledged.
  const usedProgramIds = [...new Set(rows.filter((r) => r.status === 'used' && r.program_id).map((r) => r.program_id))];
  let studentsImpacted = 0;
  if (usedProgramIds.length) {
    const { count, error: countError } = await supabaseAdmin
      .from('beneficiaries')
      .select('id', { count: 'exact', head: true })
      .in('program_id', usedProgramIds);
    if (countError) throw countError;
    studentsImpacted = count || 0;
  }

  return {
    totalDonated: rows.reduce((sum, r) => sum + Number(r.amount), 0),
    donationCount: rows.length,
    programsSupported: programs.size,
    studentsImpacted,
  };
}

// Most recent donation with an outcome recorded — backs the donor's
// "Impact of Your ₹X Donation" flow diagram.
export async function getLatestImpactDonation(donorId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('amount, outcome, impact_note, programs(name), events(title)')
    .eq('donor_id', donorId)
    .not('outcome', 'is', null)
    .order('donated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createDonation(donorId, payload) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .insert({ donor_id: donorId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrgOverview() {
  const { data, error } = await supabaseAdmin.from('org_overview').select('*').single();
  if (error) throw error;
  return data;
}

// The oldest donation still missing an outcome — what the Admin "Add
// Impact Record" form pre-fills for the admin to complete.
export async function getOldestUnannotatedDonation() {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, programs(name), events(title)')
    .is('outcome', null)
    .order('donated_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function annotateDonation(donationId, { outcome, impactNote, status }) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .update({ outcome, impact_note: impactNote, status: status || 'used' })
    .eq('id', donationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
