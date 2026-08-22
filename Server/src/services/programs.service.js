import { supabaseAdmin } from '../config/supabase.js';

export async function listActivePrograms() {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function listAllPrograms() {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .select('id, name, category, description, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProgram({ name, category, description }) {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .insert({ name, category, description })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function countPrograms({ isActive }) {
  const { count, error } = await supabaseAdmin
    .from('programs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', isActive);
  if (error) throw error;
  return count || 0;
}
