import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../../assets/logo.png';
import './Logo.css';

// Module-scoped, not component state: a client-side route change must not
// replay the entrance highlight, only a fresh page load should. This flag
// lives for the life of the JS bundle, which is exactly "one landing".
let hasPlayedLandingAnimation = false;

// `highlightOnMount` is opt-in (only the header's instance sets it) so a
// second <Logo> on the page — the footer's, say — never fights the header's
// for the one-time entrance glow.
export default function Logo({ size = 56, highlightOnMount = false }) {
  const [isLanding, setIsLanding] = useState(highlightOnMount && !hasPlayedLandingAnimation);

  useEffect(() => {
    if (!isLanding) return;
    hasPlayedLandingAnimation = true;
    const timer = setTimeout(() => setIsLanding(false), 2200);
    return () => clearTimeout(timer);
  }, [isLanding]);

  return (
    <Link to="/" className={`logo ${isLanding ? 'logo--landing' : ''}`} aria-label="Sahaay home">
      <span className="logo__glow" aria-hidden="true" />
      <img src={logoSrc} alt="Sahaay — Supporting Orphans, Building Futures" style={{ height: size }} />
    </Link>
  );
}
