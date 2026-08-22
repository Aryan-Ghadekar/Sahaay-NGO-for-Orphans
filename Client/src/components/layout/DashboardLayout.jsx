import Sidebar from '../common/Sidebar';
import './DashboardLayout.css';

export default function DashboardLayout({ items, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar items={items} />
      <main className="dashboard-layout__main">{children}</main>
    </div>
  );
}
