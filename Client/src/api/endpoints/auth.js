import { apiClient } from '../client';
import { ROLES } from '../../constants/roles';

// In mock mode there's no backend to tell us a role — infer it from the
// email so all four dashboards stay reachable for frontend-only
// development (e.g. "admin@sahaay.org" logs in as admin). Falls back to
// donor, matching a normal self-signup account.
function mockRoleFor(email) {
  const found = ROLES.find((r) => email.toLowerCase().includes(r.value));
  return found?.value || 'donor';
}

// Mock mode fabricates a session locally so AuthContext has a stable
// contract to develop against without a running backend. Real mode talks
// to Supabase Auth via the Express server — see Server/src/controllers/auth.controller.js.
export function login(email, password) {
  if (apiClient.useMocks) {
    const role = mockRoleFor(email);
    return apiClient.mock({ token: 'demo-token', user: { id: 'demo-user', email, role, full_name: email.split('@')[0] } }, 400);
  }
  return apiClient.post('/api/auth/login', { email, password });
}

// role is limited to 'donor' | 'volunteer' server-side — see Server/src/services/auth.service.js.
export function signup({ email, password, fullName, role }) {
  if (apiClient.useMocks) {
    return apiClient.mock({ token: 'demo-token', user: { id: 'demo-user', email, role, full_name: fullName } }, 400);
  }
  return apiClient.post('/api/auth/signup', { email, password, fullName, role });
}

export function logout() {
  if (apiClient.useMocks) return apiClient.mock({ ok: true });
  return apiClient.post('/api/auth/logout', {});
}

export function getCurrentUser() {
  if (apiClient.useMocks) return apiClient.mock(null);
  return apiClient.get('/api/auth/me');
}
