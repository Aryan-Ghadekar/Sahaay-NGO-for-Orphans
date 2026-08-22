import { supabaseAuth, supabaseAdmin } from '../config/supabase.js';

export async function signIn(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) throw Object.assign(new Error(error.message), { status: 401 });
  return data.session; // { access_token, refresh_token, user, ... }
}

// Self-service signup. Only 'donor' and 'volunteer' can be chosen here —
// staff/admin accounts are provisioned directly in Supabase by someone who
// already has admin access (see Server/README.md), not via public signup.
const SELF_SERVICE_ROLES = new Set(['donor', 'volunteer']);

export async function signUp({ email, password, fullName, role }) {
  if (!SELF_SERVICE_ROLES.has(role)) {
    throw Object.assign(new Error('That role cannot self-register.'), { status: 400 });
  }
  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data.session; // null if email confirmation is required — see controller
}

// Admin-only account provisioning for roles the public /signup form won't
// create (staff, admin). Uses the Admin API (service-role only) to create
// an already-confirmed user directly — no email confirmation round trip,
// since an admin is vouching for this person. The handle_new_user trigger
// still fires normally, creating the profiles row with the given role.
export async function createTeamMember({ email, password, fullName, role }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return getProfile(data.user.id);
}

export async function listTeam() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .in('role', ['staff', 'admin'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
