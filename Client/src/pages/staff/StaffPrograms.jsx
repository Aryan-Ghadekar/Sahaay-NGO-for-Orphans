import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getPrograms } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'name', label: 'Program' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', render: (r) => <span className={`tag ${r.status === 'Active' ? 'tag-sage' : 'tag-outline'}`}>{r.status}</span> },
];

export default function StaffPrograms() {
  const { data, loading } = useFetch(getPrograms, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Programs</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Every program Sahaay runs.</p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No programs yet." />}
    </DashboardLayout>
  );
}
