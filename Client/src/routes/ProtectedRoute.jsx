import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/AsyncState';

// Gates a dashboard route behind both authentication and the specific role
// it belongs to — an unauthenticated visitor is sent to /login, and a
// logged-in user of the WRONG role is sent home rather than shown a
// dashboard that isn't theirs.
export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, role, initializing } = useAuth();
  const location = useLocation();

  // A stored token from a previous visit is still being verified — treat
  // this as "unknown", not "logged out", or a page reload would always
  // bounce a valid session to /login before the check finishes.
  if (initializing) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}
