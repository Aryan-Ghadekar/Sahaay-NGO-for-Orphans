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
    .select('amount, outcome, impact_note, impact_ai_generated, programs(name), events(title)')
    .eq('donor_id', donorId)
    .not('outcome', 'is', null)
    .order('donated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Verified donations the donor left unrestricted ("wherever it's needed
// most") that the admin hasn't yet earmarked for a program — the pool the
// "Unallocated Funds" panel lets the admin assign.
export async function listUnallocatedDonations() {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, donated_at, profiles(full_name)')
    .is('program_id', null)
    .eq('verified', true)
    .order('donated_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function assignDonationProgram(donationId, programId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .update({ program_id: programId })
    .eq('id', donationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Everything the Gemini impact-story prompt needs to ground itself in the
// real program/activity this donation was allocated to.
export async function getDonationForNarrative(donationId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, programs(id, name, category, description), events(title, description, expected_impact)')
    .eq('id', donationId)
    .single();
  if (error) throw error;
  return data;
}

// Every donation still missing an outcome, oldest first — the full pending
// queue the Admin Impact page's bulk generate/save-all workflow works
// through, as opposed to getOldestUnannotatedDonation's single next-one.
export async function listAllUnannotatedDonations() {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, profiles(full_name), programs(name), events(title)')
    .is('outcome', null)
    .order('donated_at', { ascending: true });
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

// Admin's full donation ledger, across every donor — includes the payment
// screenshot so staff/admin can actually check it against the verified flag.
export async function listAllDonationsAdmin() {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, status, verified, donated_at, payment_proof_data_url, donor_note, outcome, impact_note, impact_ai_generated, profiles(full_name, email), programs(name)')
    .order('donated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// `verified` tracks whether staff confirmed the payment proof matches a
// real received payment — separate from `status` (allocated/used), which
// tracks whether the funds have since been put to work via an impact
// record. Verifying a donation doesn't imply it's been spent yet.
export async function verifyDonation(donationId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .update({ verified: true })
    .eq('id', donationId)
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

export async function annotateDonation(donationId, { outcome, impactNote, status, aiGenerated }) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .update({ outcome, impact_note: impactNote, status: status || 'used', impact_ai_generated: !!aiGenerated })
    .eq('id', donationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Per-event funds picture for the event detail dashboard. Sums every
// donation regardless of `verified` — matching org_overview's own
// total_donations definition (schema.sql), so an event's "raised" figure
// stays consistent with the org-wide total an admin already sees.
export async function getEventFundsSummary(eventId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('amount, status')
    .eq('event_id', eventId);
  if (error) throw error;
  const rows = data || [];
  return {
    raised: rows.reduce((sum, r) => sum + Number(r.amount), 0),
    used: rows.filter((r) => r.status === 'used').reduce((sum, r) => sum + Number(r.amount), 0),
  };
}
