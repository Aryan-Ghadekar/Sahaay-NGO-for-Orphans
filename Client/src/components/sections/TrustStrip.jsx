import './TrustStrip.css';

// Fast credibility signals right after the hero — before a visitor commits
// to reading About or scrolling further. Deliberately not numbers (those
// live in AboutSection/ImpactSection below) — these are trust claims, not
// stats, so the two sections don't just repeat each other.
const BADGES = [
  { icon: 'shield', label: 'Verified NGO' },
  { icon: 'eye', label: '100% Transparent' },
  { icon: 'receipt', label: 'Tax-Deductible Donations' },
  { icon: 'pin', label: '4 Centers Across India' },
];

// Same stroke-icon language as the dashboards (DashboardIcon) and the
// footer's contact icons, kept local since these four aren't reused
// elsewhere.
const ICON_PATHS = {
  shield: <><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  receipt: <><path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z" /><path d="M9 8h6M9 12h6" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
};

function TrustIcon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="container trust-strip__row">
        {BADGES.map((b) => (
          <span className="trust-strip__badge" key={b.label}>
            <TrustIcon name={b.icon} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
