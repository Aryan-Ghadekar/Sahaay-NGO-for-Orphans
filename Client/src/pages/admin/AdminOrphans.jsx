import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary, getPrograms } from '../../api/endpoints/admin';
import { imageToDataUrl } from '../../utils/imageToDataUrl';
import { calculateAge } from '../../utils/age';
import { validateOrphanForm, sanitizePhoneInput } from '../../utils/orphanValidation';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminOrphans.css';

const TODAY = new Date().toISOString().slice(0, 10);
const TABLE_COLUMN_COUNT = 16;

function truncate(text, max = 40) {
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

const EMPTY = {
  firstName: '', lastName: '', dateOfBirth: '', programId: '',
  contactNumber: '', guardianName: '', address: '', backgroundNotes: '',
  broughtByName: '', broughtByRelation: '', broughtByContact: '',
  photoDataUrl: '', broughtByPhotoDataUrl: '',
};

function toFormState(row) {
  return {
    childCode: row.childCode,
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    dateOfBirth: row.dateOfBirth || '',
    programId: row.programId || '',
    contactNumber: row.contactNumber || '',
    guardianName: row.guardianName || '',
    address: row.address || '',
    backgroundNotes: row.backgroundNotes || '',
    broughtByName: row.broughtByName || '',
    broughtByRelation: row.broughtByRelation || '',
    broughtByContact: row.broughtByContact || '',
    photoDataUrl: row.photoDataUrl || '',
    broughtByPhotoDataUrl: row.broughtByPhotoDataUrl || '',
  };
}

// The full detail form — everything the Administrator can see/edit that
// NGO staff never do: name, birth date, contact, guardian, address,
// history, brought-by details, and photos. Shared between the "view/edit a
// record" expansion and the "add a record" card below so the two never
// drift apart.
function BeneficiaryFields({ form, set, programs, errors, onPhoto, onBroughtByPhoto }) {
  const age = calculateAge(form.dateOfBirth);
  const err = (field) => errors?.[field] && <span className="field-error">{errors[field]}</span>;
  const cls = (field) => `input${errors?.[field] ? ' input-error' : ''}`;

  return (
    <>
      <div className="orphan-detail-grid">
        {form.childCode && (
          <div className="field"><label>Child ID</label>
            <input className="input" value={form.childCode} readOnly />
          </div>
        )}
        <div className="field"><label>First name</label>
          <input className={cls('firstName')} value={form.firstName} onChange={set('firstName')} />
          {err('firstName')}
        </div>
        <div className="field"><label>Last name</label>
          <input className={cls('lastName')} value={form.lastName} onChange={set('lastName')} />
          {err('lastName')}
        </div>
        <div className="field"><label>Date of birth</label>
          <input className={cls('dateOfBirth')} type="date" max={TODAY} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
          {err('dateOfBirth')}
        </div>
        <div className="field"><label>Age</label>
          <input className="input" value={age || '—'} readOnly />
        </div>
        <div className="field"><label>Program</label>
          <select className="input" value={form.programId} onChange={set('programId')}>
            <option value="">— none —</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Contact number</label>
          <input className={cls('contactNumber')} inputMode="numeric" maxLength={10} placeholder="10-digit guardian / emergency contact" value={form.contactNumber} onChange={set('contactNumber')} />
          {err('contactNumber')}
        </div>
        <div className="field"><label>Guardian / caretaker</label>
          <input className={cls('guardianName')} placeholder="e.g. Aunt, or care home warden" value={form.guardianName} onChange={set('guardianName')} />
          {err('guardianName')}
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Address / location</label>
          <input className={cls('address')} value={form.address} onChange={set('address')} />
          {err('address')}
        </div>
      </div>
      <div className="field">
        <label>History</label>
        <textarea className={cls('backgroundNotes')} rows={3} placeholder="Family background, medical notes, anything staff don't need to see" value={form.backgroundNotes} onChange={set('backgroundNotes')} />
        {err('backgroundNotes')}
      </div>
      <div className="field">
        <label>Orphan's photo</label>
        <input className="input" type="file" accept="image/*" onChange={onPhoto} />
        {form.photoDataUrl && <img className="orphan-photo-preview" src={form.photoDataUrl} alt="Orphan preview" />}
        {err('photoDataUrl')}
      </div>

      <h4 className="orphan-section-heading">Person who brought the child to the NGO</h4>
      <div className="orphan-detail-grid">
        <div className="field"><label>Name</label>
          <input className={cls('broughtByName')} value={form.broughtByName} onChange={set('broughtByName')} />
          {err('broughtByName')}
        </div>
        <div className="field"><label>Relation to child</label>
          <input className={cls('broughtByRelation')} placeholder="e.g. Neighbor, Relative, Police" value={form.broughtByRelation} onChange={set('broughtByRelation')} />
          {err('broughtByRelation')}
        </div>
        <div className="field"><label>Contact number</label>
          <input className={cls('broughtByContact')} inputMode="numeric" maxLength={10} placeholder="10-digit contact number" value={form.broughtByContact} onChange={set('broughtByContact')} />
          {err('broughtByContact')}
        </div>
      </div>
      <div className="field">
        <label>Photo</label>
        <input className="input" type="file" accept="image/*" onChange={onBroughtByPhoto} />
        {form.broughtByPhotoDataUrl && <img className="orphan-photo-preview" src={form.broughtByPhotoDataUrl} alt="Brought-by person preview" />}
        {err('broughtByPhotoDataUrl')}
      </div>
    </>
  );
}

function BeneficiaryRow({ row, programs, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(toFormState(row));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => {
    const raw = e.target.value;
    const value = (field === 'contactNumber' || field === 'broughtByContact') ? sanitizePhoneInput(raw) : raw;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };
  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, photoDataUrl }));
    setErrors((er) => ({ ...er, photoDataUrl: undefined }));
  };
  const onBroughtByPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const broughtByPhotoDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, broughtByPhotoDataUrl }));
    setErrors((er) => ({ ...er, broughtByPhotoDataUrl: undefined }));
  };

  const openDetails = () => {
    setForm(toFormState(row));
    setErrors({});
    setExpanded(true);
  };

  const save = async () => {
    const validationErrors = validateOrphanForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
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
        <td>{row.photoDataUrl ? <img className="orphan-table-thumb" src={row.photoDataUrl} alt={row.name} /> : '—'}</td>
        <td>{row.childCode}</td>
        <td>{row.name || '—'}</td>
        <td>{row.ageGroup || '—'}</td>
        <td>{row.program}</td>
        <td>{row.guardianName || '—'}</td>
        <td>{row.contactNumber || '—'}</td>
        <td title={row.address}>{truncate(row.address)}</td>
        <td title={row.backgroundNotes}>{truncate(row.backgroundNotes)}</td>
        <td>{row.broughtByName || '—'}</td>
        <td>{row.broughtByRelation || '—'}</td>
        <td>{row.broughtByContact || '—'}</td>
        <td>{row.broughtByPhotoDataUrl ? <img className="orphan-table-thumb" src={row.broughtByPhotoDataUrl} alt={row.broughtByName} /> : '—'}</td>
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
          <td colSpan={TABLE_COLUMN_COUNT}>
            <div className="orphan-detail-panel">
              <p className="dashboard-note" style={{ margin: '0 0 14px' }}>
                Full personal details — contact, guardian, address, and history are never sent to
                NGO staff accounts.
              </p>
              <BeneficiaryFields form={form} set={set} programs={programs} errors={errors} onPhoto={onPhoto} onBroughtByPhoto={onBroughtByPhoto} />
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
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => {
    const raw = e.target.value;
    const value = (field === 'contactNumber' || field === 'broughtByContact') ? sanitizePhoneInput(raw) : raw;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };
  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, photoDataUrl }));
    setErrors((er) => ({ ...er, photoDataUrl: undefined }));
  };
  const onBroughtByPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const broughtByPhotoDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, broughtByPhotoDataUrl }));
    setErrors((er) => ({ ...er, broughtByPhotoDataUrl: undefined }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = validateOrphanForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      await createBeneficiary(form);
      setForm(EMPTY);
      setErrors({});
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
        <div className="table-scroll" style={{ marginBottom: 36 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Photo</th><th>Child ID</th><th>Name</th><th>Age</th><th>Program</th>
                <th>Guardian</th><th>Contact</th><th>Address</th><th>History</th>
                <th>Brought By</th><th>Relation</th><th>Brought-by Contact</th><th>Brought-by Photo</th>
                <th>Attendance</th><th>Progress</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((row) => (
                <BeneficiaryRow key={row.id} row={row} programs={programs || []} onChanged={refetch} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <h3 className="dashboard-subheading">Add a Record</h3>
        <p className="dashboard-note" style={{ margin: '0 0 14px' }}>The Child ID is generated automatically once you save.</p>
        <form className="admin-form" onSubmit={handleAdd}>
          <BeneficiaryFields form={form} set={set} programs={programs || []} errors={errors} onPhoto={onPhoto} onBroughtByPhoto={onBroughtByPhoto} />
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add Record'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
