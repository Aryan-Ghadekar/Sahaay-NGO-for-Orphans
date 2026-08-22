// Thin fetch wrapper every endpoint module goes through. Centralizing this
// one spot is what makes swapping mocks for a real backend later a one-line
// change per endpoint instead of a site-wide find/replace.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCKS = !BASE_URL || import.meta.env.VITE_USE_MOCKS === 'true';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${message}`);
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
  del: (path) => request(path, { method: 'DELETE' }),
  mock: withLatency,
};
