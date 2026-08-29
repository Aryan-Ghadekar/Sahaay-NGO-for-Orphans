import * as profilesService from '../services/profiles.service.js';
import * as beneficiariesService from '../services/beneficiaries.service.js';
import * as programsService from '../services/programs.service.js';
import * as eventsService from '../services/events.service.js';
import * as applicationsService from '../services/applications.service.js';
import * as volunteersService from '../services/volunteers.service.js';
import * as attendanceService from '../services/attendance.service.js';
import * as certificatesService from '../services/certificates.service.js';
import { formatProgress, formatEventStatus, formatMonthYear, formatDayMonthYear } from '../utils/format.js';

export async function getOverview(req, res) {
  const [activeVolunteers, totalChildren, ongoingPrograms, upcomingEvents, pendingApplications] = await Promise.all([
    profilesService.countByRole('volunteer'),
    beneficiariesService.countBeneficiaries(),
    programsService.countPrograms({ isActive: true }),
    eventsService.countEventsByStatus('upcoming'),
    applicationsService.countPending(),
  ]);

  res.json([
    { value: activeVolunteers, label: 'Active Volunteers' },
    { value: totalChildren, label: 'Total Children' },
    { value: ongoingPrograms, label: 'Ongoing Programs' },
    { value: upcomingEvents, label: 'Upcoming Events' },
    { value: pendingApplications, label: 'Pending Applications' },
  ]);
}

// Query param ?eventId=... selects which event's queue to show; without
// one, this falls back to the event most in need of volunteers.
export async function getAssignmentQueue(req, res) {
  let { eventId } = req.query;
  if (!eventId) {
    const [upcoming] = await eventsService.listEventsByStatus('upcoming');
    eventId = upcoming?.id;
  }
  if (!eventId) return res.json([]);

  const rows = await applicationsService.listAssignmentQueue(eventId);
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.volunteers?.profiles?.full_name || 'Volunteer',
      match: `${r.match_score}%`,
      skills: (r.volunteers?.skills || []).join(', '),
      availability: r.volunteers?.availability || '—',
    }))
  );
}

export async function assign(req, res) {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: 'applicationId is required' });
  const application = await applicationsService.decideApplication(applicationId, 'approved');
  res.json(application);
}

export async function getOrphanRecords(req, res) {
  const rows = await beneficiariesService.listBeneficiariesOperational();
  res.json(
    rows.map((r) => ({
      id: r.child_code,
      name: r.full_name, // already masked ("ArXXXXX") by the service — never the real name
      ageGroup: r.age_display,
      program: r.programs?.name || '—',
      attendance: `${r.attendance_pct}%`,
      progress: formatProgress(r.progress),
    }))
  );
}

// Operational view: no email, matching the same "no PII staff doesn't need"
// rule the beneficiaries query already follows — enforced by
// listAllVolunteersMasked() never selecting it, not by hiding it here.
export async function getVolunteers(req, res) {
  const rows = await volunteersService.listAllVolunteersMasked();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.profiles?.full_name || 'Volunteer',
      skills: (r.skills || []).join(', ') || '—',
      availability: r.availability || '—',
      location: r.location || '—',
    }))
  );
}

export async function getPrograms(req, res) {
  const rows = await programsService.listAllPrograms();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category || '—',
      status: r.is_active ? 'Active' : 'Completed',
    }))
  );
}

export async function getEvents(req, res) {
  const rows = await eventsService.listAllEvents();
  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      program: r.programs?.name || '—',
      status: formatEventStatus(r.status),
      date: r.event_date ? formatMonthYear(r.event_date) : '—',
      location: r.location || '—',
      volunteersNeeded: r.volunteers_needed,
    }))
  );
}

// The full Assignments page — pending applicants across every event, not
// just the one the dashboard's queue widget shows.
export async function getAllAssignments(req, res) {
  const rows = await applicationsService.listAllPendingApplications();
  res.json(
    rows.map((r) => ({
      id: r.id,
      event: r.events?.title || '—',
      name: r.volunteers?.profiles?.full_name || 'Volunteer',
      match: `${r.match_score}%`,
      skills: (r.volunteers?.skills || []).join(', ') || '—',
      availability: r.volunteers?.availability || '—',
      date: formatMonthYear(r.applied_at),
    }))
  );
}

export async function getAttendanceQueue(req, res) {
  const [pending, recorded, certificates] = await Promise.all([
    applicationsService.listApprovedAwaitingAttendance(),
    attendanceService.listRecordedAttendance(),
    certificatesService.listAllCertificates(),
  ]);
  const certKey = (volunteerId, eventId) => `${volunteerId}:${eventId}`;
  const issuedByKey = new Map(certificates.map((c) => [certKey(c.volunteer_id, c.event_id), c]));

  res.json({
    pending: pending.map((r) => ({
      applicationId: r.id,
      volunteerId: r.volunteers?.id,
      eventId: r.events?.id,
      volunteer: r.volunteers?.profiles?.full_name || 'Volunteer',
      event: r.events?.title || '—',
      date: r.events?.event_date ? formatMonthYear(r.events.event_date) : '—',
    })),
    recorded: recorded.map((r) => {
      const minHours = Number(r.events?.min_hours_required) || 0;
      const cert = issuedByKey.get(certKey(r.volunteer_id, r.event_id));
      return {
        id: r.id,
        volunteerId: r.volunteer_id,
        eventId: r.event_id,
        volunteer: r.volunteers?.profiles?.full_name || 'Volunteer',
        event: r.events?.title || '—',
        hours: r.hours,
        minHoursRequired: minHours,
        eligible: r.hours >= minHours,
        certificateIssued: !!cert,
        issuedAt: cert ? formatDayMonthYear(cert.issued_at) : null,
        date: formatMonthYear(r.recorded_at),
      };
    }),
  });
}

// No more Present/Absent — staff just logs hours worked; 0 hours reads as
// "did not attend" without a separate flag to keep in sync.
export async function markAttendance(req, res) {
  const { applicationId, volunteerId, eventId, hours } = req.body;
  if (!volunteerId || !eventId) return res.status(400).json({ error: 'volunteerId and eventId are required' });
  const record = await attendanceService.recordAttendance(volunteerId, eventId, applicationId || null, Number(hours) || 0);
  res.json(record);
}

// Issues a certificate for a (volunteer, event) pair once their logged
// hours meet the event's min_hours_required — re-derives eligibility from
// the actual attendance row rather than trusting whatever the client sent.
export async function issueCertificate(req, res) {
  const { volunteerId, eventId } = req.body;
  if (!volunteerId || !eventId) return res.status(400).json({ error: 'volunteerId and eventId are required' });

  const event = await eventsService.getEventById(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const attendanceRow = await attendanceService.getAttendanceRecord(volunteerId, eventId);
  const hours = attendanceRow?.hours || 0;
  const minHours = Number(event.min_hours_required) || 0;
  if (hours < minHours) {
    return res.status(400).json({ error: `This volunteer has only logged ${hours} of the required ${minHours} hours.` });
  }

  const certificate = await certificatesService.issueCertificate(volunteerId, eventId, hours, req.user.id);
  res.status(201).json(certificate);
}
