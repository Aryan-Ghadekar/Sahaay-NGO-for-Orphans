import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';

const EMPTY = { name: '', category: '', description: '' };

function toFormState(row) {
  return { name: row.name, category: row.category === '—' ? '' : row.category, description: row.description, isActive: row.isActive };
}

function ProgramRow({ row, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(toFormState(row));
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    setBusy(true);
    try {
      await updateProgram(row.id, { ...form, isActive: form.isActive === true || form.isActive === 'true' });
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete program "${row.name}"? Events, beneficiaries, and donations linked to it will be un-earmarked, not deleted.`)) return;
    setBusy(true);
    try {
      await deleteProgram(row.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <tr>
        <td>{row.name}</td>
        <td>{row.category}</td>
        <td style={{ maxWidth: 320 }}>{row.description || '—'}</td>
        <td><span className={`tag ${row.status === 'Active' ? 'tag-sage' : 'tag-outline'}`}>{row.status}</span></td>
        <td style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setForm(toFormState(row)); setEditing(true); }}>Edit</button>
          <button className="btn btn-secondary btn-sm" onClick={remove} disabled={busy}>Delete</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td><input className="input" value={form.name} onChange={set('name')} /></td>
      <td><input className="input" style={{ width: 120 }} value={form.category} onChange={set('category')} /></td>
      <td><input className="input" value={form.description} onChange={set('description')} /></td>
      <td>
        <select className="input" value={String(form.isActive)} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'true' }))}>
          <option value="true">Active</option>
          <option value="false">Completed</option>
        </select>
      </td>
      <td style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
      </td>
    </tr>
  );
}

export default function AdminPrograms() {
  const { data: programs, loading, refetch } = useFetch(getPrograms, []);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProgram(form);
      setForm(EMPTY);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">NGOs / Programs</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Every program Sahaay runs, and what it&apos;s for. Add, edit, or retire a program here.
      </p>

      {loading ? <Loader /> : !programs.length ? (
        <p className="dashboard-note" style={{ marginBottom: 36 }}>No programs yet — add the first one below.</p>
      ) : (
        <table className="table" style={{ marginBottom: 36 }}>
          <thead>
            <tr><th>Program</th><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {programs.map((row) => <ProgramRow key={row.id} row={row} onChanged={refetch} />)}
          </tbody>
        </table>
      )}

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 className="dashboard-subheading">Add a Program</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field"><label>Name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="field"><label>Category</label>
            <input className="input" placeholder="e.g. Education" value={form.category} onChange={set('category')} />
          </div>
          <div className="field"><label>Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add Program'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
