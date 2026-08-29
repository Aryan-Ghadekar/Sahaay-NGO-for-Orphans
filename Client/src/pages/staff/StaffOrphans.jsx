import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getOrphanRecords } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

// Name arrives pre-masked ("ArXXXXX") from the API — it never sends the
// real full_name, and never sends contact/guardian/address/history at all
// (see Server/src/services/beneficiaries.service.js listBeneficiariesOperational).
const COLUMNS = [
  { key: 'id', label: 'Child ID' },
  { key: 'name', label: 'Name' },
  { key: 'ageGroup', label: 'Age Group' },
  { key: 'program', label: 'Program' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'progress', label: 'Progress', render: (r) => <span className={`tag ${r.progress === 'On Track' ? 'tag-sage' : 'tag-outline'}`}>{r.progress}</span> },
];

export default function StaffOrphans() {
  const { data, loading } = useFetch(getOrphanRecords, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Orphans</h2>
      <p className="dashboard-note" style={{ marginBottom: 28 }}>
        Operational view — names are masked and personal details (contact, guardian, address,
        history) are restricted to Administrators.
      </p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="No records yet." />}
    </DashboardLayout>
  );
}
