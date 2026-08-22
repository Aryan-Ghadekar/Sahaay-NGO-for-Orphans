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

export function ErrorState({ error, onRetry }) {
  return (
    <div className="async-error">
      <p>Something went wrong{error?.message ? `: ${error.message}` : '.'}</p>
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}
