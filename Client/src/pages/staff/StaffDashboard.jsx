import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Reveal from '../../components/common/Reveal';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getStaffOverview, getAssignmentQueue, getOrphanRecords } from '../../api/endpoints/staff';
import './StaffDashboard.css';

const SIDEBAR_ITEMS = [
  { to: '/staff', label: 'Dashboard', end: true },
  { to: '/staff/volunteers', label: 'Volunteers' },
  { to: '/staff/orphans', label: 'Orphans' },
  { to: '/staff/events', label: 'Events' },
  { to: '/staff/programs', label: 'Programs' },
  { to: '/staff/assignments', label: 'Assignments' },
  { to: '/staff/attendance', label: 'Attendance' },
  { to: '/staff/statistics', label: 'Statistics' },
];

export default function StaffDashboard() {
  const { data: overview, loading: overviewLoading } = useFetch(getStaffOverview, []);
  const { data: queue, loading: queueLoading } = useFetch(getAssignmentQueue, []);
  const { data: orphans, loading: orphansLoading } = useFetch(getOrphanRecords, []);

  return (
    <DashboardLayout items={SIDEBAR_ITEMS}>
      <h2 className="dashboard-title">NGO Dashboard</h2>
      <p className="dashboard-note">
        Operational view only — personal details of volunteers and children are restricted to Administrators.
      </p>

      {overviewLoading ? <Loader /> : (
        <Reveal className="staff-overview">
          {overview.map((s) => <StatCard key={s.label} value={s.value} label={s.label} />)}
        </Reveal>
      )}

      <h3 className="dashboard-subheading">Volunteer Assignment — Mathematics Support (4 needed)</h3>
      {queueLoading ? <Loader /> : (
        <table className="table" style={{ marginBottom: 40 }}>
          <thead>
            <tr><th>Volunteer ID</th><th>Match Score</th><th>Skills</th><th>Availability</th><th>Action</th></tr>
          </thead>
          <tbody>
            {queue.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td><td>{v.match}</td><td>{v.skills}</td><td>{v.availability}</td>
                <td><button className="btn btn-secondary btn-sm">Assign</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="dashboard-subheading">Orphan Records (Operational View)</h3>
      {orphansLoading ? <Loader /> : (
        <table className="table">
          <thead>
            <tr><th>Child ID</th><th>Age Group</th><th>Program</th><th>Attendance</th><th>Progress</th></tr>
          </thead>
          <tbody>
            {orphans.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.ageGroup}</td><td>{c.program}</td><td>{c.attendance}</td>
                <td><span className={`tag ${c.progress === 'On Track' ? 'tag-sage' : 'tag-outline'}`}>{c.progress}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
