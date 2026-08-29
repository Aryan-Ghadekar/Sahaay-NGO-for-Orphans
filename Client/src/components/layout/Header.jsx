import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useDonateModal } from '../../context/DonateModalContext';
import { ROLE_LABELS, ROLE_PATHS } from '../../constants/roles';
import './Header.css';

const MARKETING_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About NGO' },
  { href: '#programs', label: 'Our Programs' },
  { href: '#impact', label: 'Impact' },
  { href: '#volunteer', label: 'Volunteer' },
];

// One global nav bar for the whole app: the logo always sits at the left.
// What appears beside it depends on where you are — marketing links only
// make sense on the public Home page; a logged-in dashboard shows the
// person's role and a way out instead. There is no manual role switch
// anymore — which dashboard you can reach is decided by ProtectedRoute,
// not by a button here.
export default function Header() {
  const { isAuthenticated, role, logout } = useAuth();
  const { open: openDonateModal } = useDonateModal();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <Logo size={68} highlightOnMount />

      {isHome && (
        <nav className="app-header__links">
          {MARKETING_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      )}

      {!isAuthPage && (
        <div className="app-header__actions">
          {isHome && (
            <button className="btn btn-primary btn-sm" onClick={openDonateModal}>Donate</button>
          )}
          {isAuthenticated ? (
            <>
              {isHome && (
                <Link className="btn btn-secondary btn-sm" to={ROLE_PATHS[role]}>My Dashboard</Link>
              )}
              {!isHome && <span className="app-header__role">{ROLE_LABELS[role]}</span>}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : isHome ? (
            <Link className="btn btn-secondary btn-sm" to="/login">Login</Link>
          ) : null}
        </div>
      )}
    </header>
  );
}
