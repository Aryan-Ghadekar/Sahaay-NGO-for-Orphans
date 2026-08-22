import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { Loader } from '../../components/common/AsyncState';
import { useCountUp } from '../../hooks/useCountUp';
import { useFetch } from '../../hooks/useFetch';
import { getAdminOverview, getContentBlocks, getImpactRecordDraft } from '../../api/endpoints/admin';
import './AdminDashboard.css';

const SIDEBAR_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/website', label: 'Public Website' },
  { to: '/admin/programs', label: 'NGOs / Programs' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/donors', label: 'Donors' },
  { to: '/admin/volunteers', label: 'Volunteers' },
  { to: '/admin/orphans', label: 'Orphans' },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/impact', label: 'Impact' },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/settings', label: 'Settings' },
];

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

const ICON_PATHS = {
  wallet: <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M2 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" /></>,
  heart: <path d="M12 20s-7-4.4-9.3-8.6C1.2 8.7 2.5 5.6 5.4 5c2-.4 3.8.6 4.6 2.2C10.8 5.6 12.6 4.6 14.6 5c2.9.6 4.2 3.7 2.7 6.4C19 15.6 12 20 12 20z" />,
  book: <><path d="M12 6c-1.6-1.4-4-2-6.5-2C4.7 4 4 4.4 4 5v13c0 .6.7 1 1.5 1 2.5 0 4.9.6 6.5 2 1.6-1.4 4-2 6.5-2 .8 0 1.5-.4 1.5-1V5c0-.6-.7-1-1.5-1-2.5 0-4.9.6-6.5 2z" /><path d="M12 6v14" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.3 2.3 4.7-5" /></>,
  star: <path d="m12 2 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
};

function StatIcon({ name }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name] || ICON_PATHS.dot}
    </svg>
  );
}

function AdminStat({ label, value }) {
  const meta = STAT_META[label] || { icon: 'dot', theme: 'navy' };
  const [ref, display] = useCountUp(value);
  return (
    <div className="admin-stat card card-hover" ref={ref}>
      <span className={`admin-stat__icon admin-stat__icon--${meta.theme}`}>
        <StatIcon name={meta.icon} />
      </span>
      <div>
        <b className="admin-stat__value">{display}</b>
        <span className="admin-stat__label">{label}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: overview, loading: overviewLoading } = useFetch(getAdminOverview, []);
  const { data: blocks, loading: blocksLoading } = useFetch(getContentBlocks, []);
  const { data: draft, loading: draftLoading } = useFetch(getImpactRecordDraft, []);

  return (
    <DashboardLayout items={SIDEBAR_ITEMS}>
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

      <div className="admin-columns">
        <div className="card admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__icon admin-panel__icon--navy"><StatIcon name="book" /></span>
            <h3>Public Website Content</h3>
          </div>
          {blocksLoading ? <Loader /> : (
            <div className="admin-content-list">
              {blocks.map((b) => (
                <div className="admin-content-row" key={b}>
                  <span>{b}</span>
                  <button className="btn btn-secondary btn-sm">Edit</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__icon admin-panel__icon--accent"><StatIcon name="check" /></span>
            <h3>Add Impact Record</h3>
          </div>
          {draftLoading ? <Loader /> : (
            <div className="admin-form">
              <div className="field"><label>Donation</label><input className="input" value={draft.donation} readOnly /></div>
              <div className="field"><label>Program</label><input className="input" value={draft.program} readOnly /></div>
              <div className="field"><label>Event / Activity</label><input className="input" value={draft.activity} readOnly /></div>
              <div className="field"><label>Outcome</label><input className="input" value={draft.outcome} readOnly /></div>
              <div className="field"><label>Impact</label><input className="input" value={draft.impact} readOnly /></div>
              <button className="btn btn-primary btn-block">Save Impact Record</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
