// Thin fetch wrapper every endpoint module goes through. Centralizing this
// one spot is what makes swapping mocks for a real backend later a one-line
// change per endpoint instead of a site-wide find/replace.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCKS = !BASE_URL || import.meta.env.VITE_USE_MOCKS === 'true';

// localStorage is the single source of truth for the bearer token — both
// this module and AuthContext read/write the same key, so there's no
// separate in-memory copy that could drift out of sync between them.
const TOKEN_KEY = 'sahaay_token';
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// Simulated network latency for mock mode so loading states are visible
// during development instead of resolving instantly.
const withLatency = (data, ms = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const apiClient = {
  useMocks: USE_MOCKS,
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  mock: withLatency,
};
