import './ProgressBar.css';

// value/max drive the fill; label is optional text shown above the bar
// (e.g. "3 of 5 complete").
export default function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-bar">
      {label && <div className="progress-bar__label">{label}</div>}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
