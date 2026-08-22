import { supabaseAdmin } from '../config/supabase.js';

export async function listEventsByStatus(status) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, description, status, event_date, location, volunteers_needed, expected_impact, programs(name)')
    .eq('status', status)
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function listUpcomingEventsRaw() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, description, location, volunteers_needed')
    .eq('status', 'upcoming');
  if (error) throw error;
  return data;
}

export async function countEventsByStatus(status) {
  const { count, error } = await supabaseAdmin
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);
  if (error) throw error;
  return count || 0;
}

export async function getEventById(id) {
  const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
