import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getApplications, getAttendance } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

const APPLICATION_COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Applied' },
  { key: 'status', label: 'Status', render: (a) => <span className={`tag ${a.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>{a.status}</span> },
];

const ATTENDANCE_COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'attended', label: 'Outcome', render: (r) => <span className={`tag ${r.attended ? 'tag-sage' : 'tag-outline'}`}>{r.attended ? 'Attended' : 'Missed'}</span> },
];

// Your whole volunteering record in one place — applications (what you
// signed up for) and attendance (what actually happened) side by side,
// rather than duplicating either page's job.
export default function VolunteerHistory() {
  const { data: applications, loading: appsLoading } = useFetch(getApplications, []);
  const { data: attendance, loading: attLoading } = useFetch(getAttendance, []);

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">History</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Your full volunteering record with Sahaay.</p>

      <h3 className="dashboard-subheading">Applications</h3>
      {appsLoading ? <Loader /> : (
        <div style={{ marginBottom: 36 }}>
          <SimpleTable columns={APPLICATION_COLUMNS} rows={applications} emptyMessage="No applications yet." />
        </div>
      )}

      <h3 className="dashboard-subheading">Attendance</h3>
      {attLoading ? <Loader /> : <SimpleTable columns={ATTENDANCE_COLUMNS} rows={attendance} emptyMessage="No attendance recorded yet." />}
    </DashboardLayout>
  );
}
