import { apiClient } from '../client';
import { impactStats, impactBreakdown, ongoingEvents, upcomingEvents } from '../mockData/publicSite';

// Every export mirrors a real REST call the backend will eventually serve.
// TODO(backend): replace the mock branch with the commented apiClient call
// once the endpoint exists — the function signature and shape stay the same.
export function getImpactStats() {
  if (apiClient.useMocks) return apiClient.mock(impactStats);
  return apiClient.get('/api/public/impact-stats');
}

export function getImpactBreakdown() {
  if (apiClient.useMocks) return apiClient.mock(impactBreakdown);
  return apiClient.get('/api/public/impact-breakdown');
}

export function getEvents() {
  if (apiClient.useMocks) return apiClient.mock({ ongoing: ongoingEvents, upcoming: upcomingEvents });
  return apiClient.get('/api/public/events');
}
