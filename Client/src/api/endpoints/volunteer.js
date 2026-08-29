import { apiClient } from '../client';
import { volunteerProfile, recommendedEvent, applications, availableEvents, attendanceHistory } from '../mockData/volunteer';

export function getVolunteerProfile() {
  if (apiClient.useMocks) return apiClient.mock(volunteerProfile);
  return apiClient.get('/api/volunteer/profile');
}

// payload: { skills: string[] | comma-string, qualification, availability, location }
export function updateVolunteerProfile(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload }, 400);
  return apiClient.patch('/api/volunteer/profile', payload);
}

export function getRecommendedEvent() {
  if (apiClient.useMocks) return apiClient.mock(recommendedEvent);
  return apiClient.get('/api/volunteer/recommended');
}

export function getAvailableEvents() {
  if (apiClient.useMocks) return apiClient.mock(availableEvents);
  return apiClient.get('/api/volunteer/events');
}

export function getApplications() {
  if (apiClient.useMocks) return apiClient.mock(applications);
  return apiClient.get('/api/volunteer/applications');
}

export function applyToEvent(eventId) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, eventId });
  return apiClient.post('/api/volunteer/applications', { eventId });
}

export function getAttendance() {
  if (apiClient.useMocks) return apiClient.mock(attendanceHistory);
  return apiClient.get('/api/volunteer/attendance');
}
