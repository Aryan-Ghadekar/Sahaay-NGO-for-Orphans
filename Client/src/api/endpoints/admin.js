import { apiClient } from '../client';
import {
  adminOverview,
  impactRecordForm,
  team,
  adminPrograms,
  adminEvents,
  adminVolunteers,
  adminOrphans,
  adminDonors,
  adminDonations,
  unallocatedFunds,
  impactRecordDrafts,
  siteImages,
} from '../mockData/admin';

export function getAdminOverview() {
  if (apiClient.useMocks) return apiClient.mock(adminOverview);
  return apiClient.get('/api/admin/overview');
}

// The two site-wide landing-page images (Hero, Volunteer CTA) not tied to
// any specific program/event.
export function getSiteImages() {
  if (apiClient.useMocks) return apiClient.mock(siteImages);
  return apiClient.get('/api/admin/site-images');
}

// payload: { key: 'hero_image' | 'volunteer_cta_image', imageDataUrl }
export function updateSiteImage(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload }, 400);
  return apiClient.put('/api/admin/site-images', payload);
}

export function getImpactRecordDraft() {
  if (apiClient.useMocks) return apiClient.mock(impactRecordForm);
  return apiClient.get('/api/admin/impact-records/draft');
}

// The full pending queue (every donation still missing an outcome), for
// the Impact page's bulk generate/save-all board.
export function getImpactRecordDrafts() {
  if (apiClient.useMocks) return apiClient.mock(impactRecordDrafts);
  return apiClient.get('/api/admin/impact-records/drafts');
}

export function saveImpactRecord(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload });
  return apiClient.post('/api/admin/impact-records', payload);
}

// payload: { records: [{ donationId, outcome, impact, aiGenerated }] }
export function saveImpactRecordsBatch(payload) {
  if (apiClient.useMocks) return apiClient.mock(payload.records.map((r) => ({ ok: true, ...r })), 500);
  return apiClient.post('/api/admin/impact-records/batch', payload);
}

export function getTeam() {
  if (apiClient.useMocks) return apiClient.mock(team);
  return apiClient.get('/api/admin/team');
}

// payload: { email, password, fullName, role: 'staff' | 'admin' }
export function createTeamMember(payload) {
  if (apiClient.useMocks) {
    return apiClient.mock({ id: `demo-${Date.now()}`, full_name: payload.fullName, email: payload.email, role: payload.role }, 500);
  }
  return apiClient.post('/api/admin/team', payload);
}

export function getPrograms() {
  if (apiClient.useMocks) return apiClient.mock(adminPrograms);
  return apiClient.get('/api/admin/programs');
}

// payload: { name, category, description }
export function createProgram(payload) {
  if (apiClient.useMocks) return apiClient.mock({ id: `demo-${Date.now()}`, ...payload }, 400);
  return apiClient.post('/api/admin/programs', payload);
}

// payload: { name, category, description, isActive }
export function updateProgram(id, payload) {
  if (apiClient.useMocks) return apiClient.mock({ id, ...payload }, 400);
  return apiClient.patch(`/api/admin/programs/${id}`, payload);
}

export function deleteProgram(id) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true }, 300);
  return apiClient.del(`/api/admin/programs/${id}`);
}

export function getEvents() {
  if (apiClient.useMocks) return apiClient.mock(adminEvents);
  return apiClient.get('/api/admin/events');
}

// payload: { title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl }
export function createEvent(payload) {
  if (apiClient.useMocks) return apiClient.mock({ id: `demo-${Date.now()}`, ...payload }, 400);
  return apiClient.post('/api/admin/events', payload);
}

export function updateEvent(id, payload) {
  if (apiClient.useMocks) return apiClient.mock({ id, ...payload }, 400);
  return apiClient.patch(`/api/admin/events/${id}`, payload);
}

export function deleteEvent(id) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true }, 300);
  return apiClient.del(`/api/admin/events/${id}`);
}

export function getVolunteers() {
  if (apiClient.useMocks) return apiClient.mock(adminVolunteers);
  return apiClient.get('/api/admin/volunteers');
}

export function getBeneficiaries() {
  if (apiClient.useMocks) return apiClient.mock(adminOrphans);
  return apiClient.get('/api/admin/beneficiaries');
}

// payload: { childCode, fullName, ageGroup, programId, attendancePct, progress }
export function createBeneficiary(payload) {
  if (apiClient.useMocks) return apiClient.mock({ id: `demo-${Date.now()}`, ...payload }, 400);
  return apiClient.post('/api/admin/beneficiaries', payload);
}

export function updateBeneficiary(id, payload) {
  if (apiClient.useMocks) return apiClient.mock({ id, ...payload }, 400);
  return apiClient.patch(`/api/admin/beneficiaries/${id}`, payload);
}

export function deleteBeneficiary(id) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true }, 300);
  return apiClient.del(`/api/admin/beneficiaries/${id}`);
}

export function getDonors() {
  if (apiClient.useMocks) return apiClient.mock(adminDonors);
  return apiClient.get('/api/admin/donors');
}

export function getDonations() {
  if (apiClient.useMocks) return apiClient.mock(adminDonations);
  return apiClient.get('/api/admin/donations');
}

export function verifyDonation(id) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, id, verified: true }, 300);
  return apiClient.post(`/api/admin/donations/${id}/verify`, {});
}

// ---------- Funds (unrestricted donations awaiting a program) ----------
export function getUnallocatedFunds() {
  if (apiClient.useMocks) return apiClient.mock(unallocatedFunds);
  return apiClient.get('/api/admin/funds/unallocated');
}

export function assignDonationProgram(id, programId) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, id, programId }, 400);
  return apiClient.patch(`/api/admin/donations/${id}/assign-program`, { programId });
}

// Drafts a donation's outcome + impact sentence with Gemini straight from
// the program/activity it's allocated to. `outcome` is optional — pass it
// only if the admin already typed one and just wants a matching sentence.
// payload: { donationId, outcome? }
export function generateImpactText(payload) {
  if (apiClient.useMocks) {
    const outcome = payload.outcome || '120 school kits distributed';
    return apiClient.mock({
      outcome,
      impact: `Thanks to this gift, ${outcome.toLowerCase()} — a direct result of your generosity.`,
    }, 700);
  }
  return apiClient.post('/api/admin/impact-records/generate', payload);
}
