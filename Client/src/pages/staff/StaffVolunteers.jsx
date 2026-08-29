import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteers } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

// No email column — deliberately: the API this calls never selects it
// (see Server/src/services/volunteers.service.js listAllVolunteersMasked),
// so there's nothing here to accidentally leak.
const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'skills', label: 'Skills' },
  { key: 'availability', label: 'Availability' },
  { key: 'location', label: 'Location' },
];

export default function StaffVolunteers() {
  const { data, loading } = useFetch(getVolunteers, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Volunteers</h2>
      <p className="dashboard-note" style={{ marginBottom: 28 }}>
        Operational view — contact details are restricted to Administrators.
      </p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No volunteers have signed up yet." />}
    </DashboardLayout>
  );
}
