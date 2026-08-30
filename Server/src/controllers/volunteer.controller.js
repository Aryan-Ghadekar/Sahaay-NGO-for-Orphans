import * as volunteersService from '../services/volunteers.service.js';
import * as eventsService from '../services/events.service.js';
import * as applicationsService from '../services/applications.service.js';
import * as attendanceService from '../services/attendance.service.js';
import * as certificatesService from '../services/certificates.service.js';
import { scoreMatch, pickRecommendedEvent } from '../utils/matching.js';
import { formatApplicationStatus, formatDayMonthYear, formatMonthYear } from '../utils/format.js';
import { isValidName, isValidPhone } from '../utils/validators.js';

export async function getProfile(req, res) {
  const [volunteer, stats] = await Promise.all([
    volunteersService.getVolunteerFull(req.user.id),
    volunteersService.getVolunteerStats(req.user.id),
  ]);

  res.json({
    name: volunteer.profiles?.full_name || req.user.full_name,
    firstName: volunteer.first_name || '',
    lastName: volunteer.last_name || '',
    dateOfBirth: volunteer.date_of_birth || '',
    mobileNumber: volunteer.mobile_number || '',
    address: volunteer.address || '',
    photoDataUrl: volunteer.photo_data_url || '',
    skills: volunteer.skills || [],
    availability: volunteer.availability || 'Flexible',
    qualification: volunteer.qualification || '',
    location: volunteer.location || '',
    stats: [
      { value: stats.total_events, label: 'Total Events' },
      { value: stats.volunteer_hours, label: 'Volunteer Hours' },
      { value: stats.certificates_earned, label: 'Certificates Earned' },
    ],
  });
}

export async function updateProfile(req, res) {
  const { firstName, lastName, dateOfBirth, mobileNumber, address, photoDataUrl, skills, qualification, availability, location } = req.body;

  if (!isValidName(firstName)) return res.status(400).json({ error: 'A valid first name (letters only) is required.' });
  if (!isValidName(lastName)) return res.status(400).json({ error: 'A valid last name (letters only) is required.' });
  if (!dateOfBirth) return res.status(400).json({ error: 'Date of birth is required.' });
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) return res.status(400).json({ error: 'Enter a valid date of birth.' });
  if (!isValidPhone(mobileNumber)) return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
  if (!address || !address.trim()) return res.status(400).json({ error: 'Address is required.' });
  if (photoDataUrl && !/^data:image\//i.test(photoDataUrl)) return res.status(400).json({ error: 'photoDataUrl must be a data:image/ URL' });

  const parsedSkills = Array.isArray(skills)
    ? skills
    : String(skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const volunteer = await volunteersService.updateVolunteerProfile(req.user.id, {
    firstName, lastName, dateOfBirth, mobileNumber, address, photoDataUrl,
    skills: parsedSkills, qualification, availability, location,
  });
  res.json(volunteer);
}

// Every upcoming event, with this volunteer's match score and whether
// they've already applied — the "Available Events" browsing page (the
// dashboard's "Recommended" widget only ever shows the single best one).
export async function getAvailableEvents(req, res) {
  const [volunteer, upcoming, appliedEventIds] = await Promise.all([
    volunteersService.getVolunteerWithProfile(req.user.id),
    eventsService.listEventsByStatus('upcoming'),
    applicationsService.listAppliedEventIds(req.user.id),
  ]);

  // Scored first as numbers and sorted descending so the page's "ranked by
  // how well it matches" claim is actually true, instead of the prior
  // event-date ordering the score was just decorating.
  const scored = upcoming
    .map((event) => ({ event, score: scoreMatch(volunteer, event) }))
    .sort((a, b) => b.score - a.score);

  res.json(
    scored.map(({ event, score }) => ({
      id: event.id,
      title: event.title,
      program: event.programs?.name || '—',
      location: event.location || '—',
      date: event.event_date ? formatMonthYear(event.event_date) : '—',
      volunteersNeeded: event.volunteers_needed,
      match: `${score}%`,
      applied: appliedEventIds.has(event.id),
    }))
  );
}

// Hours logged per event plus certificate status — replaces the old
// Present/Absent attendance view. "eligible" just means the logged hours
// meet that event's min_hours_required; issuing the certificate itself is
// a separate staff/admin action.
export async function getCertificates(req, res) {
  const [rows, certificates] = await Promise.all([
    attendanceService.listAttendanceForVolunteer(req.user.id),
    certificatesService.listCertificatesForVolunteer(req.user.id),
  ]);
  const certByEvent = new Map(certificates.map((c) => [c.event_id, c]));

  res.json(
    rows.map((r) => {
      const cert = certByEvent.get(r.event_id);
      const minHours = Number(r.events?.min_hours_required) || 0;
      return {
        id: r.id,
        event: r.events?.title || '—',
        date: formatMonthYear(r.recorded_at),
        hours: r.hours,
        minHoursRequired: minHours,
        eligible: r.hours >= minHours,
        certificateIssued: !!cert,
        issuedAt: cert ? formatDayMonthYear(cert.issued_at) : null,
        volunteerName: req.user.full_name,
      };
    })
  );
}

export async function getRecommended(req, res) {
  const [volunteer, upcoming, appliedEventIds] = await Promise.all([
    volunteersService.getVolunteerWithProfile(req.user.id),
    eventsService.listUpcomingEventsRaw(),
    applicationsService.listAppliedEventIds(req.user.id),
  ]);

  const pick = pickRecommendedEvent(volunteer, upcoming, appliedEventIds);
  if (!pick) return res.json(null);

  const parts = [];
  if (pick.event.location) parts.push(pick.event.location);
  parts.push(`${pick.event.volunteers_needed} volunteers needed`);

  res.json({
    eventId: pick.event.id,
    title: pick.event.title,
    match: `${pick.score}% Match`,
    meta: parts.join(' · '),
    skillsMatch: pick.breakdown.skills.matched,
    availabilityMatch: pick.breakdown.availability.matched,
    locationMatch: pick.breakdown.location.matched,
  });
}

export async function getApplications(req, res) {
  const rows = await applicationsService.listApplicationsForVolunteer(req.user.id);
  res.json(
    rows.map((r) => ({
      id: r.id,
      event: r.events?.title || '—',
      match: `${r.match_score}%`,
      date: formatDayMonthYear(r.applied_at),
      status: formatApplicationStatus(r.status),
    }))
  );
}

export async function apply(req, res) {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ error: 'eventId is required' });

  const [volunteer, event] = await Promise.all([
    volunteersService.getVolunteerWithProfile(req.user.id),
    eventsService.getEventById(eventId),
  ]);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const score = scoreMatch(volunteer, event);
  const application = await applicationsService.createApplication(req.user.id, eventId, score);
  res.status(201).json(application);
}
