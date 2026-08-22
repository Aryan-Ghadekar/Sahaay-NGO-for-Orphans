import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import './Login.css';

// Demo login: no real credential check yet — picks a role and calls the
// (currently mocked) auth endpoint so the rest of the app already talks to
// a real async login contract before a backend exists. Once real auth
// exists, the role dropdown goes away — the backend returns the role tied
// to the account, it isn't chosen at sign-in.
export default function Login() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[0].value);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email || 'demo@sahaay.org', role);
    const target = ROLES.find((r) => r.value === role)?.path || '/';
    navigate(target);
  };

  return (
    <div className="login-page">
      <form className="login-card card" onSubmit={handleSubmit}>
        <h2 className="login-card__title">Welcome back</h2>
        <p className="login-card__subtitle">Sign in to continue to your Sahaay dashboard.</p>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Continue as</span>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
