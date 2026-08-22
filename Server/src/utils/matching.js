// Heuristic match score between a volunteer and an event: skill-keyword
// overlap with the event's title/description, plus a flat baseline so a
// volunteer with no listed skills still gets a plausible score rather than
// 0. This is intentionally simple — swap for a real scoring model later
// without touching any caller, since everything here funnels through
// scoreMatch().
export function scoreMatch(volunteer, event) {
  const text = `${event.title} ${event.description || ''}`.toLowerCase();
  const skills = volunteer.skills || [];
  const hits = skills.filter((skill) => text.includes(String(skill).toLowerCase())).length;

  const base = 70;
  const perHit = skills.length ? Math.round(25 / skills.length) : 0;
  const score = base + hits * perHit;

  return Math.min(99, Math.max(base, score));
}

// Picks the best not-yet-applied-to upcoming event for a volunteer.
export function pickRecommendedEvent(volunteer, upcomingEvents, appliedEventIds) {
  const candidates = upcomingEvents.filter((e) => !appliedEventIds.has(e.id));
  if (!candidates.length) return null;

  let best = candidates[0];
  let bestScore = scoreMatch(volunteer, best);
  for (const event of candidates.slice(1)) {
    const score = scoreMatch(volunteer, event);
    if (score > bestScore) {
      best = event;
      bestScore = score;
    }
  }
  return { event: best, score: bestScore };
}
