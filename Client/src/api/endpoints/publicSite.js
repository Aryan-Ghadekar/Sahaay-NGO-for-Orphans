import { apiClient } from '../client';
import { impactStats, impactBreakdown, ongoingEvents, upcomingEvents, programs, siteImages } from '../mockData/publicSite';

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

// Populates the Donate form's program dropdown.
export function getPrograms() {
  if (apiClient.useMocks) return apiClient.mock(programs);
  return apiClient.get('/api/public/programs');
}

// Hero/Volunteer CTA images an admin has replaced — Home.jsx falls back to
// the bundled default photo for any key that comes back null.
export function getSiteImages() {
  if (apiClient.useMocks) return apiClient.mock(siteImages);
  return apiClient.get('/api/public/site-images');
}
