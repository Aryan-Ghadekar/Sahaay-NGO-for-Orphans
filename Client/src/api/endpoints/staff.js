import { apiClient } from '../client';
import {
  staffOverview,
  assignmentQueue,
  orphanRecords,
  staffVolunteers,
  staffPrograms,
  staffEvents,
  allAssignments,
  attendanceQueue,
  eventDetail,
  orphanVisits,
} from '../mockData/staff';

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

export function assignApplication(applicationId) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, applicationId });
  return apiClient.post('/api/staff/assignments', { applicationId });
}

// Masked — no email. Matches the real API's query-level omission, not a
// UI-only hide.
export function getVolunteers() {
  if (apiClient.useMocks) return apiClient.mock(staffVolunteers);
  return apiClient.get('/api/staff/volunteers');
}

export function getPrograms() {
  if (apiClient.useMocks) return apiClient.mock(staffPrograms);
  return apiClient.get('/api/staff/programs');
}

export function getEvents() {
  if (apiClient.useMocks) return apiClient.mock(staffEvents);
  return apiClient.get('/api/staff/events');
}

export function getEventDetail(id) {
  if (apiClient.useMocks) return apiClient.mock(eventDetail);
  return apiClient.get(`/api/staff/events/${id}`);
}

// payload: { itemKey, isDone }
export function updateEventChecklist(id, payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload }, 300);
  return apiClient.patch(`/api/staff/events/${id}/checklist`, payload);
}

// Staff identifies a child only by Child ID — never the real beneficiary
// UUID (see Server's getOrphanRecords, which returns child_code as `id`).
export function getOrphanVisits(childCode) {
  if (apiClient.useMocks) return apiClient.mock(orphanVisits);
  return apiClient.get(`/api/staff/orphans/${childCode}/visits`);
}

// payload: { visitorName, relation, visitDate, notes }
export function logOrphanVisit(childCode, payload) {
  if (apiClient.useMocks) return apiClient.mock({ id: `visit-${Date.now()}`, ...payload }, 400);
  return apiClient.post(`/api/staff/orphans/${childCode}/visits`, payload);
}

export function getAllAssignments() {
  if (apiClient.useMocks) return apiClient.mock(allAssignments);
  return apiClient.get('/api/staff/assignments/all');
}

export function getAttendanceQueue() {
  if (apiClient.useMocks) return apiClient.mock(attendanceQueue);
  return apiClient.get('/api/staff/attendance');
}

// payload: { applicationId, volunteerId, eventId, hours }
export function markAttendance(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload }, 400);
  return apiClient.post('/api/staff/attendance', payload);
}

// payload: { volunteerId, eventId } — hours are re-derived server-side from
// the logged attendance row, not trusted from the client.
export function issueCertificate(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload }, 400);
  return apiClient.post('/api/staff/certificates', payload);
}

// applicationId is decoded client-side from the scanned QR. The server
// re-derives everything else (status, event date, check-in/out state) —
// this is just "here's the code that was scanned."
export function scanQrCode(applicationId) {
  if (apiClient.useMocks) return apiClient.mock({ action: 'checked_in', volunteer: 'Demo Volunteer', checkedInAt: new Date().toISOString() }, 400);
  return apiClient.post('/api/staff/scan', { applicationId });
}
