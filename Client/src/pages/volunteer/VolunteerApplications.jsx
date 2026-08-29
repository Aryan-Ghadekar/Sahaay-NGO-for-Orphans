import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getApplications } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'match', label: 'Match Score' },
  { key: 'date', label: 'Date' },
  {
    key: 'status',
    label: 'Status',
    render: (a) => (
      <span className={`tag ${a.status === 'Approved' ? 'tag-sage' : a.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>
        {a.status}
      </span>
    ),
  },
];

export default function VolunteerApplications() {
  const { data, loading } = useFetch(getApplications, []);
  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Applications</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Every event you've applied to, and where it stands.</p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="You haven't applied to any events yet." />}
    </DashboardLayout>
  );
}
