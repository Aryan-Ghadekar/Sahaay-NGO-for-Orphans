import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import ImpactRecordsBoard from '../../components/admin/ImpactRecordsBoard';
import { useFetch } from '../../hooks/useFetch';
import { getDonations } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminImpact.css';

const COLUMNS = [
  { key: 'donor', label: 'Donor' },
  { key: 'program', label: 'Program' },
  { key: 'amount', label: 'Amount' },
  { key: 'outcome', label: 'Outcome', render: (r) => r.outcome || <span className="tag tag-outline">Not yet recorded</span> },
  { key: 'impact', label: 'Impact', render: (r) => r.impact || '—' },
];

export default function AdminImpact() {
  const { data: donations, loading: donationsLoading } = useFetch(getDonations, []);

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Impact</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Turn donations into recorded outcomes — this is what donors see on their own dashboard.
        Generate drafts straight from each donation&apos;s program data, review, then save.
      </p>

      <h3 className="dashboard-subheading">Pending Impact Records</h3>
      <ImpactRecordsBoard />

      <h3 className="dashboard-subheading">All Donations</h3>
      {donationsLoading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={donations} emptyMessage="No donations yet." />}
    </DashboardLayout>
  );
}
