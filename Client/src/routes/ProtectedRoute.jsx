import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates a dashboard route behind both authentication and the specific role
// it belongs to — an unauthenticated visitor is sent to /login, and a
// logged-in user of the WRONG role is sent home rather than shown a
// dashboard that isn't theirs.
export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}
