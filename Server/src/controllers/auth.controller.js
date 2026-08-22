import * as authService from '../services/auth.service.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const session = await authService.signIn(email, password);
  const profile = await authService.getProfile(session.user.id);
  res.json({ token: session.access_token, user: profile });
}

export async function signup(req, res) {
  const { email, password, fullName, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'email, password, and role are required' });
  }

  const session = await authService.signUp({ email, password, fullName, role });
  if (!session) {
    // Email confirmation is required by the Supabase project's Auth
    // settings — there's no access token until they confirm.
    return res.status(202).json({ message: 'Check your email to confirm your account before signing in.' });
  }
  const profile = await authService.getProfile(session.user.id);
  res.status(201).json({ token: session.access_token, user: profile });
}

export async function logout(req, res) {
  // Sign-out is really a client-side concern (drop the stored token) —
  // this endpoint exists so the frontend has a symmetrical call to make.
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json(req.user);
}
