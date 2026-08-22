import { apiClient } from '../client';

// No real auth backend yet — these resolve locally so AuthContext has a
// stable contract to code against. Swap the mock branch for real calls
// once the auth service exists; callers never change.
export function login({ email, role }) {
  if (apiClient.useMocks) {
    return apiClient.mock({ id: 'demo-user', email, role, name: email.split('@')[0] }, 400);
  }
  return apiClient.post('/api/auth/login', { email, role });
}

export function logout() {
  if (apiClient.useMocks) return apiClient.mock({ ok: true });
  return apiClient.post('/api/auth/logout', {});
}

export function getCurrentUser() {
  if (apiClient.useMocks) return apiClient.mock(null);
  return apiClient.get('/api/auth/me');
}
