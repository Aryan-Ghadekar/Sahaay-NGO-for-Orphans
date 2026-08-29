import './AsyncState.css';

// Shared loading/error/empty rendering for every useFetch-backed page, so
// each dashboard doesn't hand-roll its own spinner markup.
export function Loader({ label = 'Loading…' }) {
  return (
    <div className="async-loader">
      <span className="async-loader__spinner" />
      <span>{label}</span>
    </div>
  );
}

// Full-page centered spinner — shown while the whole app is still figuring
// out who's logged in (see ProtectedRoute's `initializing` check), as
// opposed to Loader's small inline one used inside an already-rendered
// page while a section's data fetches.
export function PageLoader() {
  return (
    <div className="page-loader">
      <span className="page-loader__spinner" />
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="async-error">
      <p>Something went wrong{error?.message ? `: ${error.message}` : '.'}</p>
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}
