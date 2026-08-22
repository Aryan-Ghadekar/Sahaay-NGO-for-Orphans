import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import NotFound from '../pages/public/NotFound';
import DonorDashboard from '../pages/donor/DonorDashboard';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

// Flat route table on purpose: sub-pages under each dashboard (e.g.
// /volunteer/applications) are stubbed in Sidebar link lists but not yet
// routed to their own screens. Add them here as those screens get built —
// the sidebar links already point at the right paths, and should be wrapped
// in the same ProtectedRoute as their parent.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/donor"
        element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>}
      />
      <Route
        path="/volunteer"
        element={<ProtectedRoute allowedRole="volunteer"><VolunteerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/staff"
        element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
