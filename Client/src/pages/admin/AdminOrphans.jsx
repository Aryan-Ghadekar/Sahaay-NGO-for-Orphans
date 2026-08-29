import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary, getPrograms } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminOrphans.css';

const PROGRESS_OPTIONS = [
  { value: 'on_track', label: 'On Track' },
  { value: 'needs_support', label: 'Needs Support' },
];

const EMPTY = {
  childCode: '', fullName: '', ageGroup: '', programId: '', attendancePct: 0, progress: 'on_track',
  contactNumber: '', guardianName: '', address: '', backgroundNotes: '',
};

function toFormState(row) {
  return {
    childCode: row.childCode,
    fullName: row.name,
    ageGroup: row.ageGroup,
    programId: row.programId || '',
    attendancePct: row.attendancePct,
    progress: row.progress,
    contactNumber: row.contactNumber || '',
    guardianName: row.guardianName || '',
    address: row.address || '',
    backgroundNotes: row.backgroundNotes || '',
  };
}

// The full detail form — everything the Administrator can see/edit that
// NGO staff never do: name, contact, guardian, address, history. Shared
// between the "view/edit a record" expansion and the "add a record" card
// below so the two never drift apart.
function BeneficiaryFields({ form, set, programs }) {
  return (
    <>
      <div className="orphan-detail-grid">
        <div className="field"><label>Child ID</label>
          <input className="input" required placeholder="e.g. CHD-1104" value={form.childCode} onChange={set('childCode')} />
        </div>
        <div className="field"><label>Full name</label>
          <input className="input" value={form.fullName} onChange={set('fullName')} />
        </div>
        <div className="field"><label>Age group</label>
          <input className="input" placeholder="e.g. 9–12" value={form.ageGroup} onChange={set('ageGroup')} />
        </div>
        <div className="field"><label>Program</label>
          <select className="input" value={form.programId} onChange={set('programId')}>
            <option value="">— none —</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Attendance %</label>
          <input className="input" type="number" min="0" max="100" value={form.attendancePct} onChange={set('attendancePct')} />
        </div>
        <div className="field"><label>Progress</label>
          <select className="input" value={form.progress} onChange={set('progress')}>
            {PROGRESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="field"><label>Contact number</label>
          <input className="input" placeholder="Guardian / emergency contact" value={form.contactNumber} onChange={set('contactNumber')} />
        </div>
        <div className="field"><label>Guardian / caretaker</label>
          <input className="input" placeholder="e.g. Aunt, or care home warden" value={form.guardianName} onChange={set('guardianName')} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Address / location</label>
          <input className="input" value={form.address} onChange={set('address')} />
        </div>
      </div>
      <div className="field">
        <label>Background / history</label>
        <textarea className="input" rows={3} placeholder="Family background, medical notes, anything staff don't need to see" value={form.backgroundNotes} onChange={set('backgroundNotes')} />
      </div>
    </>
  );
}

function BeneficiaryRow({ row, programs, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(toFormState(row));
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openDetails = () => {
    setForm(toFormState(row));
    setExpanded(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateBeneficiary(row.id, form);
      setExpanded(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove record ${row.childCode}? This can't be undone.`)) return;
    setBusy(true);
    try {
      await deleteBeneficiary(row.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr>
        <td>{row.childCode}</td>
        <td>{row.name || '—'}</td>
        <td>{row.ageGroup || '—'}</td>
        <td>{row.program}</td>
        <td>{row.attendance}</td>
        <td><span className={`tag ${row.progress === 'on_track' ? 'tag-sage' : 'tag-outline'}`}>{row.progressLabel}</span></td>
        <td style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => (expanded ? setExpanded(false) : openDetails())}>
            {expanded ? 'Hide Details' : 'Full Details'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={remove} disabled={busy}>Delete</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7}>
            <div className="orphan-detail-panel">
              <p className="dashboard-note" style={{ margin: '0 0 14px' }}>
                Full personal details — contact, guardian, address, and history are never sent to
                NGO staff accounts.
              </p>
              <BeneficiaryFields form={form} set={set} programs={programs} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(false)} disabled={busy}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrphans() {
  const { data: beneficiaries, loading, refetch } = useFetch(getBeneficiaries, []);
  const { data: programs } = useFetch(getPrograms, []);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createBeneficiary(form);
      setForm(EMPTY);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Orphans</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Full records — including name, contact, guardian, address, and history — are restricted
        to Administrators. NGO staff see a masked, operational-only view. Add, edit, or remove
        records here.
      </p>

      {loading ? <Loader /> : !beneficiaries.length ? (
        <p className="dashboard-note" style={{ marginBottom: 36 }}>No records yet — add the first one below.</p>
      ) : (
        <table className="table" style={{ marginBottom: 36 }}>
          <thead>
            <tr><th>Child ID</th><th>Name</th><th>Age Group</th><th>Program</th><th>Attendance</th><th>Progress</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {beneficiaries.map((row) => (
              <BeneficiaryRow key={row.id} row={row} programs={programs || []} onChanged={refetch} />
            ))}
          </tbody>
        </table>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <h3 className="dashboard-subheading">Add a Record</h3>
        <form className="admin-form" onSubmit={handleAdd}>
          <BeneficiaryFields form={form} set={set} programs={programs || []} />
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add Record'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
