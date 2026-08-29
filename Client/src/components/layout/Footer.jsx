import Logo from './Logo';
import './Footer.css';

const QUICK_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About NGO' },
  { href: '#programs', label: 'Our Programs' },
  { href: '#impact', label: 'Impact' },
  { href: '#volunteer', label: 'Volunteer' },
];

// Placeholder contact details and social links — swap these for Sahaay's
// real address/phone/inbox and live profiles before this goes to
// production; hrefs are "#" until real profile URLs exist.
const CONTACT = {
  address: '12 MG Road, Pune, Maharashtra 411001, India',
  phone: '+91 98765 43210',
  email: 'hello@sahaay.org',
};

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'X (Twitter)', href: '#', icon: 'twitter' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
];

const SOCIAL_ICON_PATHS = {
  facebook: <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4.02v2.3H7.9v3h2.47V21z" fill="currentColor" stroke="none" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></>,
  twitter: <path d="M4 4l7.5 9.6L4.4 20H7l5.8-5.6L17 20h3l-7.9-10L19.6 4H17l-5.3 5.1L7 4z" fill="currentColor" stroke="none" />,
  youtube: <><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" /></>,
};

function SocialIcon({ name }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {SOCIAL_ICON_PATHS[name]}
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__grid">
        <div className="app-footer__brand">
          <Logo size={48} />
          <p className="app-footer__tagline">Supporting orphans, building futures.</p>
          <p className="app-footer__blurb">
            Sahaay connects donors, volunteers, and NGO programs so every contribution turns into a
            traceable outcome for a child who needs it.
          </p>
          <div className="app-footer__social">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="app-footer__social-link">
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="app-footer__col">
          <h4 className="app-footer__heading">Quick Links</h4>
          <ul className="app-footer__links">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="app-footer__col">
          <h4 className="app-footer__heading">Contact Us</h4>
          <ul className="app-footer__contact">
            <li>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{CONTACT.address}</span>
            </li>
            <li>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2z" />
              </svg>
              <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}>{CONTACT.phone}</a>
            </li>
            <li>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
              </svg>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="app-footer__bottom container">
        <p className="app-footer__copy">© {new Date().getFullYear()} Sahaay. All rights reserved.</p>
      </div>
    </footer>
  );
}
