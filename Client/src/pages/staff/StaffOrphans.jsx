import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getOrphanRecords, getOrphanVisits, logOrphanVisit } from '../../api/endpoints/staff';
import { validateVisitForm } from '../../utils/visitValidation';
import { STAFF_NAV } from '../../constants/nav';
import './StaffOrphans.css';

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY_VISIT = { visitorName: '', relation: '', visitDate: '', notes: '' };

// Name arrives pre-masked ("ArXXXXX") from the API — it never sends the
// real full_name, and never sends contact/guardian/address/history at all
// (see Server/src/services/beneficiaries.service.js listBeneficiariesOperational).
// Logging a visit still works without any of that: staff identify the
// child only by Child ID, which the server resolves to the real record
// server-side — the visitor's identity/relation is all that's captured
// here, never the child's real name.
function OrphanRow({ row }) {
  const [expanded, setExpanded] = useState(false);
  const [visits, setVisits] = useState(null);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_VISIT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const loadVisits = async () => {
    setVisitsLoading(true);
    try {
      setVisits(await getOrphanVisits(row.id));
    } finally {
      setVisitsLoading(false);
    }
  };

  const toggle = () => {
    if (!expanded) loadVisits();
    setExpanded((e) => !e);
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateVisitForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      await logOrphanVisit(row.id, form);
      setForm(EMPTY_VISIT);
      setErrors({});
      loadVisits();
    } finally {
      setSaving(false);
    }
  };

  const err = (field) => errors[field] && <span className="field-error">{errors[field]}</span>;
  const cls = (field) => `input${errors[field] ? ' input-error' : ''}`;

  return (
    <>
      <tr>
        <td>{row.id}</td>
        <td>{row.name}</td>
        <td>{row.ageGroup}</td>
        <td>{row.program}</td>
        <td>{row.attendance}</td>
        <td><span className={`tag ${row.progress === 'On Track' ? 'tag-sage' : 'tag-outline'}`}>{row.progress}</span></td>
        <td>
          <button className="btn btn-secondary btn-sm" onClick={toggle}>{expanded ? 'Hide Visits' : 'Log Visit'}</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7}>
            <div className="visit-log-panel">
              <h4 className="dashboard-subheading" style={{ marginTop: 0 }}>Visitor Log — {row.id}</h4>
              {visitsLoading ? <Loader /> : !visits?.length ? (
                <p className="dashboard-note" style={{ marginBottom: 16 }}>No visits logged yet.</p>
              ) : (
                <table className="table" style={{ marginBottom: 16 }}>
                  <thead><tr><th>Visitor</th><th>Relation</th><th>Date</th><th>Notes</th></tr></thead>
                  <tbody>
                    {visits.map((v) => (
                      <tr key={v.id}><td>{v.visitorName}</td><td>{v.relation}</td><td>{v.visitDate}</td><td>{v.notes || '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              <form onSubmit={submit} className="admin-form">
                <div className="visit-log-grid">
                  <div className="field"><label>Visitor name</label>
                    <input className={cls('visitorName')} value={form.visitorName} onChange={set('visitorName')} />
                    {err('visitorName')}
                  </div>
                  <div className="field"><label>Relation to child</label>
                    <input className={cls('relation')} placeholder="e.g. Aunt, Neighbor" value={form.relation} onChange={set('relation')} />
                    {err('relation')}
                  </div>
                  <div className="field"><label>Visit date</label>
                    <input className={cls('visitDate')} type="date" max={TODAY} value={form.visitDate} onChange={set('visitDate')} />
                    {err('visitDate')}
                  </div>
                </div>
                <div className="field"><label>Notes (optional)</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} />
                </div>
                <button className="btn btn-primary btn-sm" type="submit" disabled={saving} style={{ marginTop: 8 }}>
                  {saving ? 'Saving…' : 'Add Visit'}
                </button>
              </form>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function StaffOrphans() {
  const { data, loading } = useFetch(getOrphanRecords, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Orphans</h2>
      <p className="dashboard-note" style={{ marginBottom: 28 }}>
        Operational view — names are masked and personal details (contact, guardian, address,
        history) are restricted to Administrators. You can still log visitor details by Child ID.
      </p>
      {loading ? <Loader /> : !data.length ? (
        <p className="dashboard-note">No records yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Child ID</th><th>Name</th><th>Age Group</th><th>Program</th><th>Attendance</th><th>Progress</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {data.map((row) => <OrphanRow key={row.id} row={row} />)}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
