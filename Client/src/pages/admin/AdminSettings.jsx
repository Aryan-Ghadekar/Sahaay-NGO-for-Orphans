import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_NAV } from '../../constants/nav';
import { ROLE_LABELS } from '../../constants/roles';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Settings</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Your account details.</p>

      <div className="card" style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field"><label>Full name</label><input className="input" value={user.full_name || ''} readOnly /></div>
        <div className="field"><label>Email</label><input className="input" value={user.email} readOnly /></div>
        <div className="field"><label>Role</label><input className="input" value={ROLE_LABELS[user.role]} readOnly /></div>
      </div>
    </DashboardLayout>
  );
}
