import { apiClient } from '../client';
import { donorSummary, donationHistory, impactFlow, impactNote, impactAiGenerated } from '../mockData/donor';

export function getDonorSummary() {
  if (apiClient.useMocks) return apiClient.mock(donorSummary);
  return apiClient.get('/api/donor/summary');
}

export function getDonationHistory() {
  if (apiClient.useMocks) return apiClient.mock(donationHistory);
  return apiClient.get('/api/donor/donations');
}

export function getImpactFlow() {
  if (apiClient.useMocks) return apiClient.mock({ steps: impactFlow, note: impactNote, aiGenerated: impactAiGenerated });
  return apiClient.get('/api/donor/impact-flow');
}

// payload: { programId, amount, proofDataUrl, note }
export function createDonation(payload) {
  if (apiClient.useMocks) return apiClient.mock({ ok: true, id: 'demo-donation', ...payload }, 800);
  return apiClient.post('/api/donor/donations', payload);
}
