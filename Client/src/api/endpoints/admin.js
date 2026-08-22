import { apiClient } from '../client';
import { adminOverview, contentBlocks, impactRecordForm } from '../mockData/admin';

export function getAdminOverview() {
  if (apiClient.useMocks) return apiClient.mock(adminOverview);
  return apiClient.get('/api/admin/overview');
}

export function getContentBlocks() {
  if (apiClient.useMocks) return apiClient.mock(contentBlocks);
  return apiClient.get('/api/admin/content-blocks');
}

export function getImpactRecordDraft() {
  if (apiClient.useMocks) return apiClient.mock(impactRecordForm);
  return apiClient.get('/api/admin/impact-records/draft');
}

export function saveImpactRecord(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, ...payload });
  return apiClient.post('/api/admin/impact-records', payload);
}
