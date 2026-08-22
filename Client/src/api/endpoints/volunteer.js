import { apiClient } from '../client';
import { volunteerProfile, recommendedEvent, applications } from '../mockData/volunteer';

export function getVolunteerProfile() {
  if (apiClient.useMocks) return apiClient.mock(volunteerProfile);
  return apiClient.get('/api/volunteer/profile');
}

export function getRecommendedEvent() {
  if (apiClient.useMocks) return apiClient.mock(recommendedEvent);
  return apiClient.get('/api/volunteer/recommended');
}

export function getApplications() {
  if (apiClient.useMocks) return apiClient.mock(applications);
  return apiClient.get('/api/volunteer/applications');
}

export function applyToEvent(eventId) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, eventId });
  return apiClient.post('/api/volunteer/applications', { eventId });
}
