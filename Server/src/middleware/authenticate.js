import { supabaseAuth, supabaseAdmin } from '../config/supabase.js';

// Verifies the bearer token against Supabase Auth, then loads the matching
// profile — every downstream controller and requireRole() trusts
// req.user.role, which only ever comes from this lookup, never from
// anything the client sends.
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('id', data.user.id)
    .single();

  // A valid Supabase Auth token with no matching profile means the
  // handle_new_user trigger hasn't landed yet (a race right after signup)
  // or the row was removed — either way, not enough to act as this user.
  if (profileError || !profile) {
    return res.status(401).json({ error: 'No profile found for this account' });
  }

  req.user = profile;
  next();
}
