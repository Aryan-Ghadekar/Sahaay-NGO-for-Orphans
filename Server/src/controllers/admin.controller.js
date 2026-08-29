import * as donationsService from '../services/donations.service.js';
import * as authService from '../services/auth.service.js';
import * as programsService from '../services/programs.service.js';
import * as eventsService from '../services/events.service.js';
import * as volunteersService from '../services/volunteers.service.js';
import * as beneficiariesService from '../services/beneficiaries.service.js';
import * as profilesService from '../services/profiles.service.js';
import * as geminiService from '../services/gemini.service.js';
import * as siteContentService from '../services/siteContent.service.js';
import { formatRupeesShort, formatRupees, formatMonthYear, formatEventStatus, formatProgress } from '../utils/format.js';
import { isValidName, isValidPhone } from '../utils/validators.js';

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

const SITE_IMAGE_KEYS = new Set(['hero_image', 'volunteer_cta_image']);

// The site-wide landing-page images an admin can replace outside of any
// specific program/event (Hero, Volunteer CTA).
export async function getSiteImages(req, res) {
  const rows = await siteContentService.listSiteImages();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.image_data_url]));
  res.json({
    hero_image: byKey.hero_image || null,
    volunteer_cta_image: byKey.volunteer_cta_image || null,
  });
}

export async function updateSiteImage(req, res) {
  const { key, imageDataUrl } = req.body;
  if (!SITE_IMAGE_KEYS.has(key)) {
    return res.status(400).json({ error: `key must be one of: ${[...SITE_IMAGE_KEYS].join(', ')}` });
  }
  if (!imageDataUrl || !/^data:image\//i.test(imageDataUrl)) {
    return res.status(400).json({ error: 'imageDataUrl must be a data:image/ URL' });
  }
  const row = await siteContentService.setSiteImage(key, imageDataUrl);
  res.json(row);
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
  const { donationId, outcome, impact, aiGenerated } = req.body;
  if (!donationId || !outcome) {
    return res.status(400).json({ error: 'donationId and outcome are required' });
  }
  const donation = await donationsService.annotateDonation(donationId, { outcome, impactNote: impact, aiGenerated });
  res.json(donation);
}

// ---------- Funds (unrestricted donations awaiting a program) ----------
export async function getUnallocatedFunds(req, res) {
  const rows = await donationsService.listUnallocatedDonations();
  res.json(
    rows.map((r) => ({
      id: r.id,
      donor: r.profiles?.full_name || 'Anonymous',
      amount: formatRupees(r.amount),
      date: formatMonthYear(r.donated_at),
    }))
  );
}

export async function assignDonationProgram(req, res) {
  const { programId } = req.body;
  if (!programId) return res.status(400).json({ error: 'programId is required' });
  const donation = await donationsService.assignDonationProgram(req.params.id, programId);
  res.json(donation);
}

// Every donation still waiting on an outcome — the pending queue the
// Impact page's bulk generate/save-all board works through, as opposed to
// getImpactRecordDraft's single next-one-up shortcut on the Dashboard.
export async function getImpactRecordDrafts(req, res) {
  const rows = await donationsService.listAllUnannotatedDonations();
  res.json(
    rows.map((r) => ({
      donationId: r.id,
      donor: r.profiles?.full_name || 'Anonymous',
      donation: `₹${Number(r.amount).toLocaleString('en-IN')}`,
      program: r.programs?.name || '—',
      activity: r.events?.title || '',
      outcome: '',
      impact: '',
    }))
  );
}

// Drafts a donation's outcome + impact sentence straight from the program
// and activity it's already allocated to (and how many children that
// program actually supports) — no admin-typed outcome required. If the
// admin already typed one, it's used as the basis and kept as-is; the
// sentence is written to match it.
export async function generateImpactText(req, res) {
  const { donationId, outcome } = req.body;
  if (!donationId) return res.status(400).json({ error: 'donationId is required' });

  const donation = await donationsService.getDonationForNarrative(donationId);
  const stats = await beneficiariesService.getProgramStats(donation.programs?.id);
  const result = await geminiService.generateImpactStory({
    program: donation.programs?.name,
    category: donation.programs?.category,
    description: donation.programs?.description,
    event: donation.events?.title,
    eventDescription: donation.events?.description,
    expectedImpact: donation.events?.expected_impact,
    amount: donation.amount,
    beneficiaryCount: stats.count,
    avgAttendance: stats.avgAttendance,
    outcomeHint: outcome || null,
  });
  res.json(result);
}

// Saves a whole batch of generated/edited impact records at once — the
// Impact page's "Save All" action after "Generate All" has filled every
// pending row.
export async function saveImpactRecordsBatch(req, res) {
  const { records } = req.body;
  if (!Array.isArray(records) || !records.length) {
    return res.status(400).json({ error: 'records is required' });
  }
  const valid = records.filter((r) => r.donationId && r.outcome);
  const saved = await Promise.all(
    valid.map((r) => donationsService.annotateDonation(r.donationId, { outcome: r.outcome, impactNote: r.impact, aiGenerated: r.aiGenerated }))
  );
  res.json(saved);
}

// ---------- Programs ----------
export async function getPrograms(req, res) {
  const rows = await programsService.listAllPrograms();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category || '—',
      description: r.description || '',
      isActive: r.is_active,
      status: r.is_active ? 'Active' : 'Completed',
    }))
  );
}

export async function createProgram(req, res) {
  const { name, category, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const program = await programsService.createProgram({ name, category, description });
  res.status(201).json(program);
}

export async function updateProgram(req, res) {
  const { name, category, description, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const program = await programsService.updateProgram(req.params.id, { name, category, description, isActive });
  res.json(program);
}

export async function deleteProgram(req, res) {
  await programsService.deleteProgram(req.params.id);
  res.status(204).end();
}

// ---------- Events ----------
export async function getEvents(req, res) {
  const rows = await eventsService.listAllEvents();
  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      programId: r.program_id || '',
      program: r.programs?.name || '—',
      statusRaw: r.status,
      status: formatEventStatus(r.status),
      eventDate: r.event_date || '',
      date: r.event_date ? formatMonthYear(r.event_date) : '—',
      location: r.location || '—',
      volunteersNeeded: r.volunteers_needed,
      expectedImpact: r.expected_impact || '',
      image: r.image_data_url || null,
    }))
  );
}

export async function createEvent(req, res) {
  const { title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (imageDataUrl && !/^data:image\//i.test(imageDataUrl)) {
    return res.status(400).json({ error: 'imageDataUrl must be a data:image/ URL' });
  }
  const event = await eventsService.createEvent({ title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl });
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const { title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (imageDataUrl && !/^data:image\//i.test(imageDataUrl)) {
    return res.status(400).json({ error: 'imageDataUrl must be a data:image/ URL' });
  }
  const event = await eventsService.updateEvent(req.params.id, { title, description, programId, status, eventDate, location, volunteersNeeded, expectedImpact, imageDataUrl });
  res.json(event);
}

export async function deleteEvent(req, res) {
  await eventsService.deleteEvent(req.params.id);
  res.status(204).end();
}

// ---------- Volunteers (full — includes email) ----------
export async function getVolunteers(req, res) {
  const rows = await volunteersService.listAllVolunteersFull();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.profiles?.full_name || '—',
      email: r.profiles?.email || '—',
      skills: (r.skills || []).join(', ') || '—',
      availability: r.availability || '—',
      location: r.location || '—',
    }))
  );
}

// ---------- Beneficiaries (full — includes name + personal details, full CRUD) ----------
export async function getBeneficiaries(req, res) {
  const rows = await beneficiariesService.listBeneficiariesFull();
  res.json(
    rows.map((r) => ({
      id: r.id, // the real row id — needed for update/delete, unlike child_code
      childCode: r.child_code,
      firstName: r.first_name || '',
      lastName: r.last_name || '',
      name: r.full_name || '',
      dateOfBirth: r.date_of_birth || '',
      ageGroup: r.age_display,
      programId: r.program_id || '',
      program: r.programs?.name || '—',
      attendancePct: r.attendance_pct,
      attendance: `${r.attendance_pct}%`,
      progress: r.progress,
      progressLabel: formatProgress(r.progress),
      contactNumber: r.contact_number || '',
      guardianName: r.guardian_name || '',
      address: r.address || '',
      backgroundNotes: r.background_notes || '',
      broughtByName: r.brought_by_name || '',
      broughtByRelation: r.brought_by_relation || '',
      broughtByContact: r.brought_by_contact || '',
      photoDataUrl: r.photo_data_url || '',
      broughtByPhotoDataUrl: r.brought_by_photo_data_url || '',
    }))
  );
}

// Same field set backs both create and update — a beneficiary record is
// never partially valid, so both endpoints require the whole intake form.
function validateBeneficiaryInput({
  firstName, lastName, dateOfBirth, contactNumber, guardianName, address, backgroundNotes,
  broughtByName, broughtByRelation, broughtByContact,
}) {
  if (!isValidName(firstName)) return 'A valid first name (letters only) is required.';
  if (!isValidName(lastName)) return 'A valid last name (letters only) is required.';
  if (!dateOfBirth) return 'Date of birth is required.';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) return 'Enter a valid date of birth.';
  if (!isValidPhone(contactNumber)) return 'A valid 10-digit contact number is required.';
  if (!isValidName(guardianName)) return 'A valid guardian/caretaker name is required.';
  if (!address || !address.trim()) return 'Address / location is required.';
  if (!backgroundNotes || !backgroundNotes.trim()) return 'History is required.';
  if (!isValidName(broughtByName)) return "A valid name for the person who brought the child is required.";
  if (!broughtByRelation || !broughtByRelation.trim()) return 'Relation to the child is required.';
  if (!isValidPhone(broughtByContact)) return "A valid 10-digit contact number for the person who brought the child is required.";
  return null;
}

function validateImageField(value, label) {
  if (value && !/^data:image\//i.test(value)) return `${label} must be a data:image/ URL`;
  return null;
}

export async function createBeneficiary(req, res) {
  const {
    firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
    broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
  } = req.body;
  const validationError = validateBeneficiaryInput(req.body)
    || validateImageField(photoDataUrl, 'photoDataUrl')
    || validateImageField(broughtByPhotoDataUrl, 'broughtByPhotoDataUrl');
  if (validationError) return res.status(400).json({ error: validationError });
  const row = await beneficiariesService.createBeneficiary({
    firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
    broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
  });
  res.status(201).json(row);
}

export async function updateBeneficiary(req, res) {
  const {
    firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
    broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
  } = req.body;
  const validationError = validateBeneficiaryInput(req.body)
    || validateImageField(photoDataUrl, 'photoDataUrl')
    || validateImageField(broughtByPhotoDataUrl, 'broughtByPhotoDataUrl');
  if (validationError) return res.status(400).json({ error: validationError });
  const row = await beneficiariesService.updateBeneficiary(req.params.id, {
    firstName, lastName, dateOfBirth, programId, contactNumber, guardianName, address, backgroundNotes,
    broughtByName, broughtByRelation, broughtByContact, photoDataUrl, broughtByPhotoDataUrl,
  });
  res.json(row);
}

export async function deleteBeneficiary(req, res) {
  await beneficiariesService.deleteBeneficiary(req.params.id);
  res.status(204).end();
}

// ---------- Donors ----------
export async function getDonors(req, res) {
  const rows = await profilesService.listDonors();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.full_name || '—',
      email: r.email,
      totalDonated: formatRupees((r.donations || []).reduce((sum, d) => sum + Number(d.amount), 0)),
      donationCount: (r.donations || []).length,
    }))
  );
}

// ---------- Donations (full ledger + verify) ----------
export async function getDonations(req, res) {
  const rows = await donationsService.listAllDonationsAdmin();
  res.json(
    rows.map((r) => ({
      id: r.id,
      donor: r.profiles?.full_name || 'Anonymous',
      program: r.programs?.name || '—',
      amount: formatRupees(r.amount),
      date: formatMonthYear(r.donated_at),
      status: r.status === 'used' ? 'Used' : 'Allocated',
      verified: r.verified,
      proofUrl: r.payment_proof_data_url,
      note: r.donor_note,
      outcome: r.outcome,
      impact: r.impact_note,
      impactAiGenerated: r.impact_ai_generated,
    }))
  );
}

export async function verifyDonation(req, res) {
  const donation = await donationsService.verifyDonation(req.params.id);
  res.json(donation);
}
