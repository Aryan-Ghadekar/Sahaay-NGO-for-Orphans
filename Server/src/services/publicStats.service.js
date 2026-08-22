import { supabaseAdmin } from '../config/supabase.js';

export async function getPublicImpactStats() {
  const { data, error } = await supabaseAdmin.from('public_impact_stats').select('*').single();
  if (error) throw error;
  return data;
}

export async function getPublicImpactBreakdown() {
  const { data, error } = await supabaseAdmin.from('public_impact_breakdown').select('*');
  if (error) throw error;
  return data;
}
