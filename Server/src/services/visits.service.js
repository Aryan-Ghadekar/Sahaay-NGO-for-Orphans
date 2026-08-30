import { supabaseAdmin } from '../config/supabase.js';

// Shared by both the staff controller (resolves a child_code to this
// beneficiaryId first, since staff never has the real UUID) and the admin
// controller (already has it directly) — same functions either way.
export async function listVisitsForBeneficiary(beneficiaryId) {
  const { data, error } = await supabaseAdmin
    .from('beneficiary_visits')
    .select('id, visitor_name, relation, visit_date, notes, created_at')
    .eq('beneficiary_id', beneficiaryId)
    .order('visit_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createVisit(beneficiaryId, { visitorName, relation, visitDate, notes }, loggedBy) {
  const { data, error } = await supabaseAdmin
    .from('beneficiary_visits')
    .insert({
      beneficiary_id: beneficiaryId,
      visitor_name: visitorName,
      relation,
      visit_date: visitDate,
      notes: notes || null,
      logged_by: loggedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin-only — no staff route ever calls this.
export async function deleteVisit(visitId) {
  const { error } = await supabaseAdmin.from('beneficiary_visits').delete().eq('id', visitId);
  if (error) throw error;
}
