import Photo from '../common/Photo';
import { photos } from '../../assets/photos';
import './Hero.css';

export default function Hero({ onDonate, onVolunteer, image }) {
  return (
    <section id="home" className="hero container">
      <div className="hero__copy">
        <span className="hero__badge">🎗️ Registered NGO · 12 Years of Impact</span>
        <h1 className="hero__title">
          Together, We Can Create a <span className="hero__accent">Better Future.</span>
        </h1>
        <p className="hero__subtitle">
          Sahaay connects donations, volunteers, NGO programs and measurable impact to support
          orphaned children — so every contribution turns into a traceable outcome.
        </p>
        <div className="hero__actions">
          <button className="btn btn-primary hero__cta-glow" onClick={onDonate}>Donate Now</button>
          <button className="btn btn-secondary" onClick={onVolunteer}>Become a Volunteer</button>
        </div>
      </div>
      <div className="hero__media-wrap">
        <div className="hero__blob hero__blob--1" aria-hidden="true" />
        <div className="hero__blob hero__blob--2" aria-hidden="true" />
        <div className="hero__media">
          <Photo src={image || photos.classroomChildren} alt="Children in class, smiling" shape="rounded" />
        </div>
        <div className="hero__stat-card">
          <span className="hero__stat-icon">✓</span>
          <div>
            <b>1,240+</b>
            <span>Children Supported</span>
          </div>
        </div>
      </div>
    </section>
  );
}
