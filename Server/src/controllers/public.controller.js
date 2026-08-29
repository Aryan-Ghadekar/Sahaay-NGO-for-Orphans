import * as publicStats from '../services/publicStats.service.js';
import * as eventsService from '../services/events.service.js';
import * as programsService from '../services/programs.service.js';
import * as siteContentService from '../services/siteContent.service.js';
import { env } from '../config/env.js';
import { formatEventStatus } from '../utils/format.js';

export async function getImpactStats(req, res) {
  const stats = await publicStats.getPublicImpactStats();
  res.json([
    { value: stats.children_supported, label: 'Children Supported' },
    { value: stats.programs, label: 'Programs' },
    { value: stats.volunteers, label: 'Volunteers' },
    { value: new Date().getFullYear() - env.orgFoundedYear, label: 'Years of Service' },
  ]);
}

export async function getImpactBreakdown(req, res) {
  const rows = await publicStats.getPublicImpactBreakdown();
  res.json(rows.map((r) => ({ kicker: r.kicker, value: Number(r.value), body: r.body })));
}

function mapEvent(row) {
  const parts = [];
  if (row.event_date) {
    parts.push(`Date: ${new Date(row.event_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`);
  }
  if (row.location) parts.push(`Location: ${row.location}`);

  return {
    id: row.id,
    title: row.title,
    status: formatEventStatus(row.status),
    description: row.description,
    meta: parts.join(' · '),
    impact: row.expected_impact ? `Expected Impact: ${row.expected_impact}` : undefined,
    category: row.programs?.category,
    image: row.image_data_url || null,
  };
}

// Hero/Volunteer CTA images an admin has replaced — the frontend falls
// back to its bundled default photo for any key that comes back null.
export async function getSiteImages(req, res) {
  const rows = await siteContentService.listSiteImages();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.image_data_url]));
  res.json({
    hero_image: byKey.hero_image || null,
    volunteer_cta_image: byKey.volunteer_cta_image || null,
  });
}

// Populates the Donate form's program dropdown.
export async function getPrograms(req, res) {
  const rows = await programsService.listActivePrograms();
  res.json(rows.map((r) => ({ id: r.id, name: r.name })));
}

export async function getEvents(req, res) {
  const [ongoing, upcoming] = await Promise.all([
    eventsService.listEventsByStatus('ongoing'),
    eventsService.listEventsByStatus('upcoming'),
  ]);
  res.json({ ongoing: ongoing.map(mapEvent), upcoming: upcoming.map(mapEvent) });
}
