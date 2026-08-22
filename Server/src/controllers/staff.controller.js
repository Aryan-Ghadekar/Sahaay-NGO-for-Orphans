import * as profilesService from '../services/profiles.service.js';
import * as beneficiariesService from '../services/beneficiaries.service.js';
import * as programsService from '../services/programs.service.js';
import * as eventsService from '../services/events.service.js';
import * as applicationsService from '../services/applications.service.js';
import { formatProgress } from '../utils/format.js';

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
      ageGroup: r.age_group,
      program: r.programs?.name || '—',
      attendance: `${r.attendance_pct}%`,
      progress: formatProgress(r.progress),
    }))
  );
}
