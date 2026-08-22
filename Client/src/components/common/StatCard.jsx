import { useCountUp } from '../../hooks/useCountUp';
import './StatCard.css';

export default function StatCard({ value, label, variant = 'plain' }) {
  const [ref, display] = useCountUp(value);
  return (
    <div className={`stat-card stat-card--${variant}`} ref={ref}>
      <b className="stat-card__value">{display}</b>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
