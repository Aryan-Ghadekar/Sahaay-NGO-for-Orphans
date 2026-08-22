import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Service-role client: full DB access, bypasses RLS entirely. Every service
// module uses this — the Express middleware (authenticate + requireRole) is
// what enforces authorization for this backend, not Postgres RLS. RLS is
// still enabled in Supabase (see supabase/policies.sql) as defense-in-depth
// for any other access path.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client: used only to verify a user's access token and to perform
// sign-in/sign-up against Supabase Auth on the user's behalf.
export const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
