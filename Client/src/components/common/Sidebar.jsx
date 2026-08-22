import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// items: [{ to, label }]. NavLink handles the active-route styling itself,
// so a real router-driven sub-page (e.g. /volunteer/applications) just
// works once those routes exist — no change needed here. Logout lives only
// in the global Header now (it shows on every authenticated page), so this
// doesn't duplicate that action.
export default function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar__item ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
