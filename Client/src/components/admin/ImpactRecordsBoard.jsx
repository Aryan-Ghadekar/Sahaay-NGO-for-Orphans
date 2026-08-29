import { useEffect, useState } from 'react';
import { Loader } from '../common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getImpactRecordDrafts, generateImpactText, saveImpactRecordsBatch } from '../../api/endpoints/admin';

function toRow(draft) {
  return { ...draft, aiGenerated: false, generating: false, genError: false };
}

// The bulk counterpart to ImpactRecordForm's one-at-a-time flow: every
// donation still missing an outcome, worked through at once — "Generate
// All" drafts each row's outcome + impact straight from its program's data
// in the database, then "Save All" writes every row back in one action.
export default function ImpactRecordsBoard() {
  const { data: drafts, loading, error, refetch } = useFetch(getImpactRecordDrafts, []);
  const [rows, setRows] = useState([]);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Re-seed local editable rows whenever a fresh (post-save) pending list
  // arrives — the rows themselves are edited locally until Save All commits.
  useEffect(() => {
    if (drafts) setRows(drafts.map(toRow));
  }, [drafts]);

  const updateRow = (donationId, patch) => {
    setRows((prev) => prev.map((r) => (r.donationId === donationId ? { ...r, ...patch } : r)));
  };

  const generateOne = async (row) => {
    updateRow(row.donationId, { generating: true, genError: false });
    try {
      const result = await generateImpactText({ donationId: row.donationId, outcome: row.outcome.trim() || undefined });
      updateRow(row.donationId, { outcome: result.outcome, impact: result.impact, aiGenerated: true, generating: false });
    } catch {
      updateRow(row.donationId, { generating: false, genError: true });
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    await Promise.all(rows.map((r) => generateOne(r)));
    setGeneratingAll(false);
  };

  const handleSaveAll = async () => {
    const ready = rows.filter((r) => r.outcome.trim());
    if (!ready.length) return;
    setSaving(true);
    setSaveError(false);
    try {
      await saveImpactRecordsBatch({
        records: ready.map((r) => ({ donationId: r.donationId, outcome: r.outcome, impact: r.impact, aiGenerated: r.aiGenerated })),
      });
      setSavedCount(ready.length);
      refetch();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="dashboard-note" style={{ margin: 0 }}>Couldn&apos;t load pending impact records.</p>;
  if (!rows.length) {
    return <p className="dashboard-note" style={{ margin: 0 }}>Every donation already has an outcome recorded — nothing pending.</p>;
  }

  const readyCount = rows.filter((r) => r.outcome.trim()).length;

  return (
    <div>
      <div className="admin-impact-board__toolbar">
        <button type="button" className="btn btn-secondary" onClick={handleGenerateAll} disabled={generatingAll}>
          {generatingAll ? 'Generating…' : `✨ Generate All (${rows.length})`}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSaveAll} disabled={saving || !readyCount}>
          {saving ? 'Saving…' : `💾 Save All (${readyCount})`}
        </button>
        {saveError && <span className="login-card__error">Couldn&apos;t save — try again.</span>}
        {!saveError && savedCount > 0 && (
          <span className="admin-form__success">Saved {savedCount} record{savedCount === 1 ? '' : 's'}.</span>
        )}
      </div>

      <div className="admin-impact-board">
        {rows.map((row) => (
          <div className="admin-impact-row card" key={row.donationId}>
            <div className="admin-impact-row__meta">
              <b>{row.donor}</b>
              <span>{row.donation}</span>
              <span className="tag tag-outline">{row.program}</span>
              {row.activity && <span className="admin-team__email">{row.activity}</span>}
            </div>
            <div className="admin-impact-row__fields">
              <label className="field">
                <span>
                  Outcome {row.aiGenerated && <span className="tag tag-accent" style={{ marginLeft: 6 }}>✨ AI</span>}
                </span>
                <input
                  className="input"
                  placeholder="e.g. 120 kits distributed"
                  value={row.outcome}
                  onChange={(e) => updateRow(row.donationId, { outcome: e.target.value, aiGenerated: false })}
                />
              </label>
              <label className="field">
                <span>Impact</span>
                <input
                  className="input"
                  placeholder="e.g. 95 students supported"
                  value={row.impact}
                  onChange={(e) => updateRow(row.donationId, { impact: e.target.value, aiGenerated: false })}
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => generateOne(row)}
                disabled={row.generating}
                style={{ flexShrink: 0 }}
              >
                {row.generating ? '…' : '✨ Generate'}
              </button>
            </div>
            {row.genError && <p className="login-card__error" style={{ margin: 0 }}>Couldn&apos;t generate — check the Gemini API key, or write it yourself.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
