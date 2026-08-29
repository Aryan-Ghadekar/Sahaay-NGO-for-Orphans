import { useEffect, useState } from 'react';
import { useDonateModal } from '../../context/DonateModalContext';
import './FloatingDonateButton.css';

// Appears once a visitor has scrolled past the hero's own Donate button —
// keeps the primary CTA reachable during the long read down the page
// without competing with the hero for attention on first paint.
export default function FloatingDonateButton() {
  const { open } = useDonateModal();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`floating-donate ${visible ? 'is-visible' : ''}`}
      onClick={open}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">❤</span> Donate Now
    </button>
  );
}
