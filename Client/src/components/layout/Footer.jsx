import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <Logo size={44} />
        <p className="app-footer__tagline">Supporting orphans, building futures.</p>
        <p className="app-footer__copy">© {new Date().getFullYear()} Sahaay. All rights reserved.</p>
      </div>
    </footer>
  );
}
