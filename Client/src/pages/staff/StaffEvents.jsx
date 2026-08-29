import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getEvents } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'title', label: 'Event' },
  { key: 'program', label: 'Program' },
  { key: 'status', label: 'Status', render: (r) => <span className={`tag ${r.status === 'Ongoing' ? 'tag-sage' : r.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>{r.status}</span> },
  { key: 'date', label: 'Date' },
  { key: 'location', label: 'Location' },
];

export default function StaffEvents() {
  const { data, loading } = useFetch(getEvents, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Events</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>All ongoing, upcoming, and completed events.</p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No events yet." />}
    </DashboardLayout>
  );
}
