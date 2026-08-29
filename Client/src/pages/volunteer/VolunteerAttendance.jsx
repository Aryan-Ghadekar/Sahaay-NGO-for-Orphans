import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getAttendance } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'attended', label: 'Status', render: (r) => <span className={`tag ${r.attended ? 'tag-sage' : 'tag-outline'}`}>{r.attended ? 'Present' : 'Absent'}</span> },
  { key: 'hours', label: 'Hours' },
];

// Read-only for volunteers — only staff can mark attendance (see
// Server's POST /api/staff/attendance), this just reports what's recorded.
export default function VolunteerAttendance() {
  const { data, loading } = useFetch(getAttendance, []);
  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Attendance</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Marked by NGO staff once an event has happened.
      </p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No attendance recorded yet." />}
    </DashboardLayout>
  );
}
