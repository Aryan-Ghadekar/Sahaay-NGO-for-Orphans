import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Reveal from '../../components/common/Reveal';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getStaffOverview } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

export default function StaffStatistics() {
  const { data, loading } = useFetch(getStaffOverview, []);
  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Statistics</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Operational snapshot across programs, volunteers, and children.</p>
      {loading ? <Loader /> : (
        <Reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
          {data.map((s) => <StatCard key={s.label} value={s.value} label={s.label} variant="card" />)}
        </Reveal>
      )}
    </DashboardLayout>
  );
}
