import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PATHS } from '../../constants/roles';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(ROLE_PATHS[user.role] || '/');
    } catch {
      // error is surfaced via useAuth().error below; nothing else to do here.
    }
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="login-card__error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <p className="login-card__footnote">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
