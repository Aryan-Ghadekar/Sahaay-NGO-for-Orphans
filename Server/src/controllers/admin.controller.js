import * as donationsService from '../services/donations.service.js';
import * as authService from '../services/auth.service.js';
import { formatRupeesShort } from '../utils/format.js';

const TEAM_ROLES = new Set(['staff', 'admin']);

export async function getOverview(req, res) {
  const o = await donationsService.getOrgOverview();
  res.json([
    { value: formatRupeesShort(o.total_donations), label: 'Total Donations' },
    { value: o.total_volunteers, label: 'Total Volunteers' },
    { value: o.total_children, label: 'Total Children' },
    { value: o.active_programs, label: 'Active Programs' },
    { value: o.ongoing_events, label: 'Ongoing Events' },
    { value: o.upcoming_events, label: 'Upcoming Events' },
    { value: o.completed_events, label: 'Completed Events' },
    { value: o.students_impacted, label: 'Students Impacted' },
    { value: o.pending_applications, label: 'Pending Applications' },
  ]);
}

// Not backed by any of the 8 core tables — page-content management would
// need its own content_blocks/CMS table, which wasn't part of this schema.
// Stubbed here so the panel still renders; wire it up once that table exists.
export async function getContentBlocks(req, res) {
  res.json(['Hero text & headline', 'Mission & Vision', 'Impact statistics', 'Events & programs']);
}

export async function getImpactRecordDraft(req, res) {
  const donation = await donationsService.getOldestUnannotatedDonation();
  if (!donation) return res.json({ donation: '', program: '', activity: '', outcome: '', impact: '' });

  res.json({
    donationId: donation.id,
    donation: `₹${Number(donation.amount).toLocaleString('en-IN')}`,
    program: donation.programs?.name || '',
    activity: donation.events?.title || '',
    outcome: '',
    impact: '',
  });
}

export async function getTeam(req, res) {
  const team = await authService.listTeam();
  res.json(team);
}

export async function createTeamMember(req, res) {
  const { email, password, fullName, role } = req.body;
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: 'email, password, fullName, and role are required' });
  }
  if (!TEAM_ROLES.has(role)) {
    return res.status(400).json({ error: 'role must be "staff" or "admin"' });
  }
  const profile = await authService.createTeamMember({ email, password, fullName, role });
  res.status(201).json(profile);
}

export async function saveImpactRecord(req, res) {
  const { donationId, outcome, impact } = req.body;
  if (!donationId || !outcome) {
    return res.status(400).json({ error: 'donationId and outcome are required' });
  }
  const donation = await donationsService.annotateDonation(donationId, { outcome, impactNote: impact });
  res.json(donation);
}
