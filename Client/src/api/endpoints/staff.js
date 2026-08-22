import { apiClient } from '../client';
import { staffOverview, assignmentQueue, orphanRecords } from '../mockData/staff';

export function getStaffOverview() {
  if (apiClient.useMocks) return apiClient.mock(staffOverview);
  return apiClient.get('/api/staff/overview');
}

export function getAssignmentQueue() {
  if (apiClient.useMocks) return apiClient.mock(assignmentQueue);
  return apiClient.get('/api/staff/assignments/queue');
}

export function getOrphanRecords() {
  if (apiClient.useMocks) return apiClient.mock(orphanRecords);
  return apiClient.get('/api/staff/orphans');
}

export function assignVolunteer(volunteerId, eventId) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, volunteerId, eventId });
  return apiClient.post('/api/staff/assignments', { volunteerId, eventId });
}
