import * as volunteersService from '../services/volunteers.service.js';
import * as eventsService from '../services/events.service.js';
import * as applicationsService from '../services/applications.service.js';
import { scoreMatch, pickRecommendedEvent } from '../utils/matching.js';
import { formatApplicationStatus, formatDayMonthYear } from '../utils/format.js';

export async function getProfile(req, res) {
  const [volunteer, stats] = await Promise.all([
    volunteersService.getVolunteerWithProfile(req.user.id),
    volunteersService.getVolunteerStats(req.user.id),
  ]);

  res.json({
    name: volunteer.profiles?.full_name || req.user.full_name,
    skills: volunteer.skills || [],
    availability: volunteer.availability || 'Flexible',
    qualification: volunteer.qualification || '',
    stats: [
      { value: stats.total_events, label: 'Total Events' },
      { value: stats.events_attended, label: 'Events Attended' },
      { value: `${stats.attendance_pct}%`, label: 'Attendance' },
      { value: stats.volunteer_hours, label: 'Volunteer Hours' },
    ],
  });
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
  const score = scoreMatch(volunteer, event);
  const application = await applicationsService.createApplication(req.user.id, eventId, score);
  res.status(201).json(application);
}
