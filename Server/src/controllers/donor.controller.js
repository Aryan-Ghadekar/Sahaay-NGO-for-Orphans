import * as donations from '../services/donations.service.js';
import { formatRupees, formatMonthYear, formatDonationStatus } from '../utils/format.js';

export async function getSummary(req, res) {
  const summary = await donations.getDonorSummary(req.user.id);
  res.json({
    totalDonated: formatRupees(summary.totalDonated),
    donationCount: summary.donationCount,
    programsSupported: summary.programsSupported,
    studentsImpacted: summary.studentsImpacted,
  });
}

export async function getHistory(req, res) {
  const rows = await donations.listDonationsForDonor(req.user.id);
  res.json(
    rows.map((r) => ({
      id: r.id,
      amount: formatRupees(r.amount),
      program: r.programs?.name || '—',
      date: formatMonthYear(r.donated_at),
      status: formatDonationStatus(r.status),
    }))
  );
}

export async function getImpactFlow(req, res) {
  const donation = await donations.getLatestImpactDonation(req.user.id);
  if (!donation) return res.json({ steps: [], note: '' });

  res.json({
    steps: [
      { label: 'Donation', value: formatRupees(donation.amount) },
      { label: 'Program', value: donation.programs?.name || '—' },
      { label: 'Event / Activity', value: donation.events?.title || '—' },
      { label: 'Outcome', value: donation.outcome },
      { label: 'Impact', value: donation.impact_note, highlight: true },
    ],
    note:
      donation.impact_note &&
      `Your contribution helped support the ${donation.programs?.name || 'program'}'s work. ${donation.outcome || ''}`,
  });
}

export async function createDonation(req, res) {
  const { programId, eventId, amount, proofDataUrl, note } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'A valid amount is required' });

  // Only accept data:image/ URLs, same rule this project's own image-slot.js
  // uses for stored images — the sidecar/DB isn't guaranteed to hold only
  // what this endpoint wrote, so re-validate the shape on the way in too.
  if (proofDataUrl && !/^data:image\//i.test(proofDataUrl)) {
    return res.status(400).json({ error: 'proofDataUrl must be a data:image/ URL' });
  }

  const donation = await donations.createDonation(req.user.id, {
    program_id: programId || null,
    event_id: eventId || null,
    amount,
    payment_proof_data_url: proofDataUrl || null,
    donor_note: note || null,
    verified: false,
  });
  res.status(201).json(donation);
}
