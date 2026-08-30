import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getEvents, createEvent, updateEvent, deleteEvent, getPrograms } from '../../api/endpoints/admin';
import { imageToDataUrl } from '../../utils/imageToDataUrl';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminEvents.css';

const EMPTY = {
  title: '', description: '', programId: '', status: 'upcoming', eventDate: '',
  location: '', volunteersNeeded: 0, expectedImpact: '', imageDataUrl: '', minHoursRequired: 0,
  budgetAmount: 0,
};

function toFormState(row) {
  return {
    title: row.title,
    description: row.description || '',
    programId: row.programId || '',
    status: row.statusRaw,
    eventDate: row.eventDate || '',
    location: row.location === '—' ? '' : row.location,
    volunteersNeeded: row.volunteersNeeded,
    expectedImpact: row.expectedImpact || '',
    imageDataUrl: row.image || '',
    minHoursRequired: row.minHoursRequired || 0,
    budgetAmount: row.budgetAmount || 0,
  };
}

// Shared by the "add" card and each row's expanded edit panel — same
// fields either way, including the image that shows up on the public
// landing page's event card in place of the category default photo.
function EventFields({ form, set, programs, onImage }) {
  return (
    <>
      <div className="event-detail-grid">
        <div className="field"><label>Title</label>
          <input className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div className="field"><label>Program</label>
          <select className="input" value={form.programId} onChange={set('programId')}>
            <option value="">— none —</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="field"><label>Date</label>
          <input className="input" type="date" value={form.eventDate} onChange={set('eventDate')} />
        </div>
        <div className="field"><label>Location</label>
          <input className="input" value={form.location} onChange={set('location')} />
        </div>
        <div className="field"><label>Volunteers needed</label>
          <input className="input" type="number" min="0" value={form.volunteersNeeded} onChange={set('volunteersNeeded')} />
        </div>
        <div className="field"><label>Minimum hours for certificate</label>
          <input className="input" type="number" min="0" step="0.5" value={form.minHoursRequired} onChange={set('minHoursRequired')} />
        </div>
        <div className="field"><label>Budget (₹)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.budgetAmount} onChange={set('budgetAmount')} />
        </div>
      </div>
      <div className="field"><label>Description</label>
        <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
      </div>
      <div className="field"><label>Expected impact</label>
        <input className="input" placeholder="e.g. 60 children screened" value={form.expectedImpact} onChange={set('expectedImpact')} />
      </div>
      <div className="field">
        <label>Landing page image</label>
        <input className="input" type="file" accept="image/*" onChange={onImage} />
        {form.imageDataUrl && <img className="event-detail-preview" src={form.imageDataUrl} alt="Event preview" />}
        <span className="dashboard-note" style={{ margin: 0 }}>Leave empty to keep using the category default photo.</span>
      </div>
    </>
  );
}

function EventRow({ row, programs, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(toFormState(row));
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, imageDataUrl }));
  };

  const openEdit = () => {
    setForm(toFormState(row));
    setExpanded(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateEvent(row.id, form);
      setExpanded(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${row.title}"? Applications and attendance records tied to this event will be deleted too.`)) return;
    setBusy(true);
    try {
      await deleteEvent(row.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr>
        <td>{row.title}</td>
        <td>{row.program}</td>
        <td><span className={`tag ${row.status === 'Ongoing' ? 'tag-sage' : row.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>{row.status}</span></td>
        <td>{row.date}</td>
        <td>{row.location}</td>
        <td>{row.volunteersNeeded}</td>
        <td style={{ display: 'flex', gap: 8 }}>
          <Link className="btn btn-secondary btn-sm" to={`/admin/events/${row.id}`}>Details</Link>
          <button className="btn btn-secondary btn-sm" onClick={() => (expanded ? setExpanded(false) : openEdit())}>
            {expanded ? 'Hide' : 'Edit'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={remove} disabled={busy}>Delete</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7}>
            <div className="event-detail-panel">
              <EventFields form={form} set={set} programs={programs} onImage={onImage} />
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

export default function AdminEvents() {
  const { data: events, loading, refetch } = useFetch(getEvents, []);
  const { data: programs } = useFetch(getPrograms, []);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, imageDataUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createEvent(form);
      setForm(EMPTY);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Events</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        All ongoing, upcoming, and completed events — including the image each one shows on the
        public landing page.
      </p>

      {loading ? <Loader /> : (
        <div style={{ marginBottom: 36 }}>
          <table className="table">
            <thead>
              <tr><th>Event</th><th>Program</th><th>Status</th><th>Date</th><th>Location</th><th>Volunteers Needed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map((row) => <EventRow key={row.id} row={row} programs={programs || []} onChanged={refetch} />)}
              {!events.length && <tr><td colSpan={7} className="dashboard-note">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <h3 className="dashboard-subheading">Add an Event</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <EventFields form={form} set={set} programs={programs || []} onImage={onImage} />
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add Event'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
