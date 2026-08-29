import { useEffect, useState } from 'react';
import { saveImpactRecord, generateImpactText } from '../../api/endpoints/admin';

// Shared by the Admin dashboard's panel and the standalone Impact page —
// same "attach an outcome to the oldest un-annotated donation" flow either
// way, so it lives in one place.
export default function ImpactRecordForm({ draft, onSaved }) {
  const [outcome, setOutcome] = useState(draft.outcome || '');
  const [impact, setImpact] = useState(draft.impact || '');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  // Re-seed if a fresh draft arrives (e.g. after a save picks up the next
  // un-annotated donation) — but never clobber what the admin is mid-typing.
  useEffect(() => {
    if (status === 'idle') {
      setOutcome(draft.outcome || '');
      setImpact(draft.impact || '');
      setAiGenerated(false);
    }
  }, [draft, status]);

  // Drafts the outcome + impact sentence with Gemini straight from the
  // program/activity this donation is already allocated to in the
  // database — no typed outcome required. If the admin already typed one,
  // it's kept as-is and only the impact sentence is written to match it.
  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(false);
    try {
      const result = await generateImpactText({ donationId: draft.donationId, outcome: outcome.trim() || undefined });
      setOutcome(result.outcome);
      setImpact(result.impact);
      setAiGenerated(true);
      setStatus('idle');
    } catch {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await saveImpactRecord({ donationId: draft.donationId, outcome, impact, aiGenerated });
      setStatus('saved');
      onSaved?.();
    } catch {
      setStatus('error');
    }
  };

  if (!draft.donationId) {
    return <p className="dashboard-note" style={{ margin: 0 }}>No donations are waiting on an impact record right now.</p>;
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="field"><label>Donation</label><input className="input" value={draft.donation} readOnly /></div>
      <div className="field"><label>Program</label><input className="input" value={draft.program} readOnly /></div>
      <div className="field"><label>Event / Activity</label><input className="input" value={draft.activity} readOnly /></div>

      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? 'Generating…' : '✨ Generate Outcome & Impact with AI'}
      </button>
      {genError && <p className="login-card__error">Couldn&apos;t generate text — check the Gemini API key is configured, or write the fields yourself below.</p>}

      <div className="field">
        <label>
          Outcome {aiGenerated && <span className="tag tag-accent" style={{ marginLeft: 6 }}>✨ AI-generated</span>}
        </label>
        <input
          className="input"
          placeholder="e.g. 120 kits distributed"
          value={outcome}
          onChange={(e) => { setOutcome(e.target.value); setAiGenerated(false); setStatus('idle'); }}
          required
        />
      </div>
      <div className="field">
        <label>Impact</label>
        <input
          className="input"
          placeholder="e.g. 95 students supported"
          value={impact}
          onChange={(e) => { setImpact(e.target.value); setAiGenerated(false); setStatus('idle'); }}
        />
      </div>
      {status === 'error' && <p className="login-card__error">Couldn&apos;t save that — try again.</p>}
      {status === 'saved' && <p className="admin-form__success">Saved.</p>}
      <button className="btn btn-primary btn-block" type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving…' : 'Save Impact Record'}
      </button>
    </form>
  );
}
