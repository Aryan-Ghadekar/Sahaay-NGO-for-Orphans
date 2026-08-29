import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getDonors } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'totalDonated', label: 'Total Donated' },
  { key: 'donationCount', label: 'Donations' },
];

export default function AdminDonors() {
  const { data, loading } = useFetch(getDonors, []);
  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Donors</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Everyone who has donated to Sahaay.</p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No donors yet." />}
    </DashboardLayout>
  );
}
