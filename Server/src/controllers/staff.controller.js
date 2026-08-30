import * as profilesService from '../services/profiles.service.js';
import * as beneficiariesService from '../services/beneficiaries.service.js';
import * as programsService from '../services/programs.service.js';
import * as eventsService from '../services/events.service.js';
import * as applicationsService from '../services/applications.service.js';
import * as volunteersService from '../services/volunteers.service.js';
import * as attendanceService from '../services/attendance.service.js';
import * as certificatesService from '../services/certificates.service.js';
import * as emailService from '../services/email.service.js';
import * as eventChecklistService from '../services/eventChecklist.service.js';
import * as donationsService from '../services/donations.service.js';
import * as visitsService from '../services/visits.service.js';
import QRCode from 'qrcode';
import { formatProgress, formatEventStatus, formatMonthYear, formatDayMonthYear, formatRupees } from '../utils/format.js';

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

  // Fire-and-forget: the approval-confirmation QR email must never block or
  // fail the approval itself, even once real SMTP is slow/misconfigured —
  // deliberately not awaited here, just logged if it fails.
  applicationsService.getApplicationForScan(applicationId)
    .then(async (full) => {
      const profile = full?.volunteers?.profiles;
      if (!profile?.email) return;
      const qrBuffer = await QRCode.toBuffer(applicationId);
      await emailService.sendApprovalQrEmail({
        to: profile.email,
        volunteerName: profile.full_name,
        eventTitle: full.events?.title,
        eventDate: full.events?.event_date,
        qrBuffer,
      });
    })
    .catch((err) => console.error('[assign] approval QR email failed:', err));

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

// Full event-readiness picture: budget/funds, the 4 manual checklist items
// plus a 5th computed one (approved volunteers vs. volunteers_needed —
// never stored, so it can't drift stale), and who's actually assigned.
// Mirrored in admin.controller.js against the same shared services — this
// app never has one role's frontend call the other role's route (see
// getEvents above, already duplicated the same way).
export async function getEventDetail(req, res) {
  const { id } = req.params;
  const [event, funds, approved, checklist] = await Promise.all([
    eventsService.getEventById(id),
    donationsService.getEventFundsSummary(id),
    applicationsService.listApprovedVolunteersForEvent(id),
    eventChecklistService.listChecklistItems(id),
  ]);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const manualItems = eventChecklistService.CHECKLIST_ITEMS.map((def) => {
    const row = checklist.find((c) => c.item_key === def.key);
    return { key: def.key, label: def.label, isDone: !!row?.is_done, completedAt: row?.completed_at || null, auto: false };
  });
  const neededCount = event.volunteers_needed || 0;
  const approvedCount = approved.length;
  const items = [
    ...manualItems,
    {
      key: 'volunteers_assigned',
      label: 'Volunteers assigned',
      isDone: neededCount > 0 && approvedCount >= neededCount,
      auto: true,
      approvedCount,
      neededCount,
    },
  ];
  const doneCount = items.filter((i) => i.isDone).length;

  res.json({
    id: event.id,
    title: event.title,
    description: event.description || '',
    status: formatEventStatus(event.status),
    statusRaw: event.status,
    eventDate: event.event_date ? formatMonthYear(event.event_date) : '—',
    location: event.location || '—',
    program: event.programs?.name || '—',
    budgetAmount: Number(event.budget_amount) || 0,
    budgetAmountDisplay: formatRupees(event.budget_amount || 0),
    fundsRaised: funds.raised,
    fundsRaisedDisplay: formatRupees(funds.raised),
    fundsUsed: funds.used,
    fundsUsedDisplay: formatRupees(funds.used),
    checklist: items,
    progressPct: Math.round((doneCount / items.length) * 100),
    approvedVolunteers: approved.map((r) => ({
      id: r.volunteers?.id,
      name: r.volunteers?.profiles?.full_name || 'Volunteer',
      skills: (r.volunteers?.skills || []).join(', ') || '—',
      availability: r.volunteers?.availability || '—',
    })),
  });
}

export async function updateChecklistItem(req, res) {
  const { itemKey, isDone } = req.body;
  const valid = eventChecklistService.CHECKLIST_ITEMS.some((i) => i.key === itemKey);
  if (!valid) return res.status(400).json({ error: 'Invalid checklist item' });
  const row = await eventChecklistService.setChecklistItem(req.params.id, itemKey, !!isDone, req.user.id);
  res.json(row);
}

// Staff can log a visit but never delete one — the log is a permanent
// operational record once admin sees it. Staff also never has the real
// beneficiary UUID (see getOrphanRecords above, masked view returns
// child_code as `id`), so every call here resolves childCode first.
export async function getOrphanVisits(req, res) {
  const beneficiaryId = await beneficiariesService.getIdByChildCode(req.params.childCode);
  if (!beneficiaryId) return res.status(404).json({ error: 'Child ID not found' });
  const rows = await visitsService.listVisitsForBeneficiary(beneficiaryId);
  res.json(rows.map((r) => ({ id: r.id, visitorName: r.visitor_name, relation: r.relation, visitDate: r.visit_date, notes: r.notes || '' })));
}

export async function logOrphanVisit(req, res) {
  const { visitorName, relation, visitDate, notes } = req.body;
  if (!visitorName || !relation || !visitDate) {
    return res.status(400).json({ error: 'visitorName, relation, and visitDate are required' });
  }
  const beneficiaryId = await beneficiariesService.getIdByChildCode(req.params.childCode);
  if (!beneficiaryId) return res.status(404).json({ error: 'Child ID not found' });
  const visit = await visitsService.createVisit(beneficiaryId, { visitorName, relation, visitDate, notes }, req.user.id);
  res.status(201).json({ id: visit.id, visitorName, relation, visitDate, notes: notes || '' });
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
      checkedInAt: r.attendance?.[0]?.checked_in_at || null,
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

// Scans a volunteer's QR (their applications.id, decoded client-side from
// the camera feed) — first scan of the day records arrival, second
// records departure and computes hours automatically. Re-derives
// everything from the database rather than trusting the client for
// anything beyond "here's the code that was scanned."
export async function scanQr(req, res) {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: 'applicationId is required' });

  const application = await applicationsService.getApplicationForScan(applicationId);
  if (!application) return res.status(404).json({ error: 'Invalid QR code — application not found.' });
  if (application.status !== 'approved') {
    return res.status(400).json({ error: 'This volunteer is not approved for this event.' });
  }

  const event = application.events;
  if (!event?.event_date) return res.status(400).json({ error: 'This event has no date set.' });

  // "What day is it right now, locally" — a different problem from
  // matching.js's "which weekday does this fixed date fall on" (which is
  // correctly UTC-anchored there). This needs the NGO's actual local
  // calendar day, so it's anchored to Asia/Kolkata instead of UTC — a scan
  // just after local midnight must still count as the event day.
  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  if (todayIST !== event.event_date) {
    return res.status(400).json({ error: `Check-in is only allowed on the event date (${event.event_date}).` });
  }

  const volunteerId = application.volunteer_id;
  const eventId = application.event_id;
  const volunteerName = application.volunteers?.profiles?.full_name || 'Volunteer';

  const existing = await attendanceService.getAttendanceRecord(volunteerId, eventId);
  if (!existing || !existing.checked_in_at) {
    const record = await attendanceService.checkIn(volunteerId, eventId, applicationId);
    return res.json({ action: 'checked_in', volunteer: volunteerName, checkedInAt: record.checked_in_at });
  }
  if (!existing.checked_out_at) {
    const record = await attendanceService.checkOut(volunteerId, eventId, existing.checked_in_at);
    return res.json({ action: 'checked_out', volunteer: volunteerName, hours: record.hours });
  }
  return res.status(400).json({ error: 'This volunteer has already checked in and out for this event.' });
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
