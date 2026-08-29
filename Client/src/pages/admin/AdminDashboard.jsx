import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { Loader } from '../../components/common/AsyncState';
import DashboardIcon from '../../components/common/DashboardIcon';
import ImpactRecordForm from '../../components/admin/ImpactRecordForm';
import UnallocatedFunds from '../../components/admin/UnallocatedFunds';
import { useCountUp } from '../../hooks/useCountUp';
import { useFetch } from '../../hooks/useFetch';
import { getAdminOverview, getSiteImages, getImpactRecordDraft, getTeam, createTeamMember } from '../../api/endpoints/admin';
import { photos } from '../../assets/photos';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminDashboard.css';

// Maps each known overview stat to an icon + accent theme so the row reads
// as a dashboard instead of a bare list of numbers. Falls back to a plain
// dot for any label this map doesn't recognize, so new stats from the API
// never render broken.
const STAT_META = {
  'Total Donations': { icon: 'wallet', theme: 'accent' },
  'Total Volunteers': { icon: 'users', theme: 'sage' },
  'Total Children': { icon: 'heart', theme: 'accent' },
  'Active Programs': { icon: 'book', theme: 'navy' },
  'Ongoing Events': { icon: 'calendar', theme: 'sage' },
  'Upcoming Events': { icon: 'calendar', theme: 'navy' },
  'Completed Events': { icon: 'check', theme: 'sage' },
  'Students Impacted': { icon: 'star', theme: 'accent' },
  'Pending Applications': { icon: 'clock', theme: 'navy' },
};

function AdminStat({ label, value }) {
  const meta = STAT_META[label] || { icon: 'dot', theme: 'navy' };
  const [ref, display] = useCountUp(value);
  return (
    <div className="admin-stat card card-hover" ref={ref}>
      <span className={`admin-stat__icon admin-stat__icon--${meta.theme}`}>
        <DashboardIcon name={meta.icon} />
      </span>
      <div>
        <b className="admin-stat__value">{display}</b>
        <span className="admin-stat__label">{label}</span>
      </div>
    </div>
  );
}

const EMPTY_MEMBER = { fullName: '', email: '', password: '', role: 'staff' };

function TeamPanel() {
  const { data: team, loading: teamLoading, error: teamError, refetch } = useFetch(getTeam, []);
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [status, setStatus] = useState('idle'); // idle | saving | error

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await createTeamMember(form);
      setForm(EMPTY_MEMBER);
      setStatus('idle');
      refetch();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="card admin-panel">
      <div className="admin-panel__header">
        <span className="admin-panel__icon admin-panel__icon--navy"><DashboardIcon name="users" /></span>
        <h3>Team</h3>
      </div>

      {teamLoading ? <Loader /> : teamError ? (
        <p className="dashboard-note" style={{ margin: 0 }}>Couldn&apos;t load the team list.</p>
      ) : (
        <div className="admin-content-list">
          {team.map((m) => (
            <div className="admin-content-row" key={m.id}>
              <span>{m.full_name} <span className="admin-team__email">— {m.email}</span></span>
              <span className={`tag ${m.role === 'admin' ? 'tag-accent' : 'tag-sage'}`}>{m.role === 'admin' ? 'Administrator' : 'NGO'}</span>
            </div>
          ))}
          {team.length === 0 && <p className="dashboard-note" style={{ margin: 0 }}>Just you, for now.</p>}
        </div>
      )}

      <form className="admin-form admin-team__form" onSubmit={handleSubmit}>
        <p className="admin-team__form-title">Add a staff or admin account</p>
        <div className="field"><label>Full name</label>
          <input className="input" required value={form.fullName} onChange={handleChange('fullName')} />
        </div>
        <div className="field"><label>Email</label>
          <input className="input" type="email" required value={form.email} onChange={handleChange('email')} />
        </div>
        <div className="field"><label>Temporary password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={handleChange('password')} />
        </div>
        <div className="field"><label>Role</label>
          <select className="input" value={form.role} onChange={handleChange('role')}>
            <option value="staff">NGO</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        {status === 'error' && <p className="login-card__error">Couldn&apos;t create that account — check the email isn&apos;t already in use.</p>}
        <button className="btn btn-secondary btn-block" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Creating…' : 'Add Team Member'}
        </button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: overview, loading: overviewLoading } = useFetch(getAdminOverview, []);
  const { data: images, loading: imagesLoading } = useFetch(getSiteImages, []);
  const { data: draft, loading: draftLoading } = useFetch(getImpactRecordDraft, []);

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <div className="admin-header">
        <h2 className="dashboard-title">Administrator Dashboard</h2>
        <p className="dashboard-subtitle">
          Full visibility across programs, people, and finances — everything that keeps Sahaay
          accountable to the donors and volunteers who make it possible.
        </p>
      </div>

      {overviewLoading ? <Loader /> : (
        <Reveal className="admin-overview">
          {overview.map((s) => <AdminStat key={s.label} label={s.label} value={s.value} />)}
        </Reveal>
      )}

      <div className="card admin-panel" style={{ marginBottom: 28 }}>
        <div className="admin-panel__header">
          <span className="admin-panel__icon admin-panel__icon--accent"><DashboardIcon name="wallet" /></span>
          <h3>Unallocated Funds</h3>
        </div>
        <p className="dashboard-note" style={{ margin: '-8px 0 0' }}>
          Donations left &ldquo;wherever it&apos;s needed most&rdquo; — assign each to a program so
          its impact can be tracked and reported back to the donor.
        </p>
        <UnallocatedFunds />
      </div>

      <div className="admin-columns">
        <div className="card admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__icon admin-panel__icon--navy"><DashboardIcon name="book" /></span>
            <h3>Public Website Content</h3>
          </div>
          {imagesLoading ? <Loader /> : (
            <>
              <div className="admin-dashboard__content-thumbs">
                <img src={images.hero_image || photos.classroomChildren} alt="Hero" />
                <img src={images.volunteer_cta_image || photos.volunteerWithChildren} alt="Volunteer CTA" />
              </div>
              <Link className="btn btn-secondary btn-sm" to="/admin/content">Manage Images</Link>
            </>
          )}
        </div>

        <div className="card admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__icon admin-panel__icon--accent"><DashboardIcon name="check" /></span>
            <h3>Add Impact Record</h3>
          </div>
          {draftLoading ? <Loader /> : <ImpactRecordForm draft={draft} />}
        </div>
      </div>

      <div className="admin-team-section">
        <TeamPanel />
      </div>
    </DashboardLayout>
  );
}
