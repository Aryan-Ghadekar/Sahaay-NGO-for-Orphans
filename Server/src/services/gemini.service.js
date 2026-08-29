import { env } from '../config/env.js';

const MODEL = 'gemini-3.6-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const IMPACT_SCHEMA = {
  type: 'object',
  properties: {
    outcome: { type: 'string' },
    impact: { type: 'string' },
  },
  required: ['outcome', 'impact'],
};

// Drafts a donation's outcome + donor-facing impact sentence straight from
// what the database already knows about where the money was allocated —
// the program it funded, the activity (if any), and how many children that
// program actually supports. `outcomeHint` is optional: pass it when the
// admin already typed something in the Outcome field and just wants a
// matching impact sentence written around it; leave it out and both fields
// come back freshly drafted from the program/activity context alone.
export async function generateImpactStory({
  program,
  category,
  description,
  event,
  eventDescription,
  expectedImpact,
  amount,
  beneficiaryCount,
  avgAttendance,
  outcomeHint,
}) {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const context = [
    `Program this donation funded: ${program || 'General Fund (not earmarked for a specific program)'}`,
    category && `Program category: ${category}`,
    description && `Program description: ${description}`,
    event && `Linked activity/event: ${event}`,
    eventDescription && `Activity description: ${eventDescription}`,
    expectedImpact && `This activity's expected impact: ${expectedImpact}`,
    `Donation amount: ₹${amount}`,
    beneficiaryCount != null && `Children currently supported by this program: ${beneficiaryCount}`,
    avgAttendance != null && `Their average attendance rate: ${avgAttendance}%`,
    outcomeHint && `Known outcome to build the story around (keep this as the "outcome" field, verbatim or lightly tightened): ${outcomeHint}`,
  ]
    .filter(Boolean)
    .join('\n');

  const instruction = outcomeHint
    ? 'Using the known outcome above as the "outcome" field, write a warm, donor-facing "impact" sentence (max 30 words) that references it.'
    : 'Draft a short, concrete-sounding "outcome" phrase (max 10 words, like a metric — e.g. "40 health check-ups completed") consistent with the program/activity context above, then a warm, donor-facing "impact" sentence (max 30 words) that references it. This is a plausible illustrative story grounded in the program\'s real purpose and scale, not a fabricated exact statistic — keep it believable and proportionate to the numbers given.';

  const prompt = `You are drafting a short donor update for an NGO, from the donation record below.\n\n${context}\n\n${instruction}\nRespond with no hashtags and no quotation marks inside the sentences.`;

  const res = await fetch(`${API_URL}?key=${env.geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        // gemini-3.6-flash spends part of this budget on an internal
        // "thinking" pass before writing the visible JSON — 120 gets
        // consumed by thinking alone and comes back truncated, so this
        // needs to be generous even for a two-field response.
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: IMPACT_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response.');

  const parsed = JSON.parse(text);
  if (!parsed.outcome || !parsed.impact) throw new Error('Gemini response was missing outcome/impact.');
  return { outcome: outcomeHint || parsed.outcome, impact: parsed.impact };
}
