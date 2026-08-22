import { supabaseAdmin } from '../config/supabase.js';

// Operational view: staff see everything EXCEPT full_name. Personal
// details stay admin-only, matching the product's own "operational view"
// language — this is enforced here at the query level (full_name is never
// selected), not left to the frontend to withhold.
export async function listBeneficiariesOperational() {
  const { data, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id, child_code, age_group, attendance_pct, progress, programs(name)')
    .order('child_code');
  if (error) throw error;
  return data;
}

export async function countBeneficiaries() {
  const { count, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}
