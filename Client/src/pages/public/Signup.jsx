import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_PATHS } from '../../constants/roles';
import './Login.css';

// Self-service signup covers donor and volunteer only — staff/admin
// accounts are provisioned directly in Supabase by an existing admin (see
// Server/README.md), not handed out through a public form.
const SIGNUP_ROLES = ROLES.filter((r) => r.value === 'donor' || r.value === 'volunteer');

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(SIGNUP_ROLES[0].value);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signup({ email, password, fullName, role });
      if (result.token) navigate(ROLE_PATHS[result.user.role] || '/');
      else setPendingConfirmation(true);
    } catch {
      // error is surfaced via useAuth().error below.
    }
  };

  if (pendingConfirmation) {
    return (
      <div className="login-page">
        <div className="login-card card">
          <h2 className="login-card__title">Check your email</h2>
          <p className="login-card__subtitle">
            We sent a confirmation link to {email}. Follow it, then come back and log in.
          </p>
          <Link className="btn btn-primary btn-block" to="/login">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card card" onSubmit={handleSubmit}>
        <h2 className="login-card__title">Create your account</h2>
        <p className="login-card__subtitle">Join Sahaay as a donor or volunteer.</p>
        <label className="field">
          <span>Full name</span>
          <input
            className="input"
            required
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="field">
          <span>I want to join as</span>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {SIGNUP_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        {error && <p className="login-card__error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="login-card__footnote">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
