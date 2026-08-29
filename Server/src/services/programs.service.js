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

export async function updateProgram(id, { name, category, description, isActive }) {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .update({ name, category, description, is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// program_id references on beneficiaries/events/donations are all
// `on delete set null` (see schema.sql) — removing a program un-earmarks
// those rows rather than cascading, so this is safe even for a program
// with history behind it.
export async function deleteProgram(id) {
  const { error } = await supabaseAdmin.from('programs').delete().eq('id', id);
  if (error) throw error;
}

export async function countPrograms({ isActive }) {
  const { count, error } = await supabaseAdmin
    .from('programs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', isActive);
  if (error) throw error;
  return count || 0;
}
