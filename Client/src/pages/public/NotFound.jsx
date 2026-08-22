import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '100px 40px', textAlign: 'center' }}>
      <h2 style={{ fontSize: 28, marginBottom: 12 }}>Page not found</h2>
      <p style={{ color: 'var(--color-neutral-700)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link className="btn btn-primary" to="/">Back to Home</Link>
    </div>
  );
}
