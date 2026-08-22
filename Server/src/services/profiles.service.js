import { supabaseAdmin } from '../config/supabase.js';

export async function listDonors() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, created_at, donations(amount)')
    .eq('role', 'donor')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function countByRole(role) {
  const { count, error } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', role);
  if (error) throw error;
  return count || 0;
}
