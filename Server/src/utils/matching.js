// Real signal-based volunteer/event matching, replacing a placeholder that
// only did substring-matching on skills with an arbitrary 70-99 range.
// Three factors, each independently scored 0-100 or `null` when there's no
// usable signal on either side (missing data is excluded from the final
// average, never treated as a hard 0 — a volunteer who hasn't listed
// skills yet shouldn't be punished for it).

const MIN_TOKEN_LENGTH = 3; // a 1-2 char skill/location fragment would substring-match almost anything
const WEIGHTS = { skills: 0.5, availability: 0.3, location: 0.2 };
const WEEKEND_DAYS = new Set([0, 6]); // Sun, Sat (UTC)

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildEventCorpus(event) {
  return normalizeText(`${event.title || ''} ${event.description || ''} ${event.programs?.category || ''}`);
}

// Word-boundary keyword overlap between the volunteer's skills and the
// event's title/description/program category — proportional score, no
// artificial floor/ceiling.
export function computeSkillMatch(volunteer, event) {
  const validSkills = (Array.isArray(volunteer.skills) ? volunteer.skills : [])
    .map(normalizeText)
    .filter((s) => s.length >= MIN_TOKEN_LENGTH);

  if (!validSkills.length) return { score: null, matched: false };

  const corpus = buildEventCorpus(event);
  if (!corpus) return { score: null, matched: false };

  let hits = 0;
  for (const skill of validSkills) {
    let found;
    try {
      found = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i').test(corpus);
    } catch {
      found = corpus.includes(skill); // unreachable in practice given escaping, kept as a safety net
    }
    if (found) hits += 1;
  }

  return { score: Math.round((hits / validSkills.length) * 100), matched: hits > 0 };
}

// Derives the event date's weekday/weekend-ness and compares it to the
// volunteer's stated availability preference.
export function computeAvailabilityMatch(volunteer, event) {
  const pref = normalizeText(volunteer.availability);
  if (!['weekdays', 'weekends', 'flexible'].includes(pref)) return { score: null, matched: false };
  if (!event.event_date) return { score: null, matched: false };

  // event_date is a DATE-only string (e.g. "2026-08-30"). `new Date(str).getDay()`
  // reads that UTC-midnight instant back through the LOCAL timezone, which can
  // shift the apparent day by one west of UTC — pairing an explicit UTC time
  // with getUTCDay() keeps day-of-week derivation timezone-independent.
  const parsed = new Date(`${event.event_date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return { score: null, matched: false };

  const isWeekend = WEEKEND_DAYS.has(parsed.getUTCDay());
  if (pref === 'flexible') return { score: 100, matched: true };
  const wantsWeekend = pref === 'weekends';
  return wantsWeekend === isWeekend ? { score: 100, matched: true } : { score: 0, matched: false };
}

// Compares volunteer/event location strings — exact match scores highest,
// a substring relationship (e.g. "Pune" vs "Pune Center") still counts as
// a genuine partial match.
export function computeLocationMatch(volunteer, event) {
  const vLoc = normalizeText(volunteer.location);
  const eLoc = normalizeText(event.location);
  if (!vLoc || !eLoc) return { score: null, matched: false };

  if (vLoc === eLoc) return { score: 100, matched: true };
  if (vLoc.length >= MIN_TOKEN_LENGTH && eLoc.length >= MIN_TOKEN_LENGTH && (vLoc.includes(eLoc) || eLoc.includes(vLoc))) {
    return { score: 60, matched: true };
  }
  return { score: 0, matched: false };
}

// Combines the three factors into one score, renormalizing weights over
// whichever factors actually had a signal (a factor with no signal is
// dropped from both the numerator and the weight total, not scored as 0).
export function scoreMatchDetailed(volunteer, event) {
  const skills = computeSkillMatch(volunteer, event);
  const availability = computeAvailabilityMatch(volunteer, event);
  const location = computeLocationMatch(volunteer, event);

  const factors = [
    { ...skills, weight: WEIGHTS.skills },
    { ...availability, weight: WEIGHTS.availability },
    { ...location, weight: WEIGHTS.location },
  ].filter((f) => f.score !== null);

  let score = 0;
  if (factors.length) {
    const weightSum = factors.reduce((s, f) => s + f.weight, 0);
    const weighted = factors.reduce((s, f) => s + f.weight * f.score, 0);
    score = Math.round(weighted / weightSum);
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    skills: { score: skills.score, matched: skills.matched },
    availability: { score: availability.score, matched: availability.matched },
    location: { score: location.score, matched: location.matched },
  };
}

// Stable single-number API for every call site that only needs a score
// (persisted on applications.match_score, displayed on Available Events,
// read back for the staff assignment queue/list).
export function scoreMatch(volunteer, event) {
  return scoreMatchDetailed(volunteer, event).score;
}

// Picks the best not-yet-applied-to upcoming event for a volunteer, along
// with the per-factor breakdown so the Dashboard's Skills/Availability/
// Location checkmarks can reflect what actually matched.
export function pickRecommendedEvent(volunteer, upcomingEvents, appliedEventIds) {
  const candidates = upcomingEvents.filter((e) => !appliedEventIds.has(e.id));
  if (!candidates.length) return null;

  let best = candidates[0];
  let bestDetail = scoreMatchDetailed(volunteer, best);
  for (const event of candidates.slice(1)) {
    const detail = scoreMatchDetailed(volunteer, event);
    if (detail.score > bestDetail.score) {
      best = event;
      bestDetail = detail;
    }
  }
  return {
    event: best,
    score: bestDetail.score,
    breakdown: { skills: bestDetail.skills, availability: bestDetail.availability, location: bestDetail.location },
  };
}
