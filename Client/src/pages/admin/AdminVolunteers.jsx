import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteers } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'skills', label: 'Skills' },
  { key: 'availability', label: 'Availability' },
  { key: 'location', label: 'Location' },
];

export default function AdminVolunteers() {
  const { data, loading } = useFetch(getVolunteers, []);
  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Volunteers</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Full contact details — visible here only, not on the NGO staff view.
      </p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No volunteers have signed up yet." />}
    </DashboardLayout>
  );
}
