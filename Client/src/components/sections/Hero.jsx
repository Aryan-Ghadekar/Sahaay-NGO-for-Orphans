import ImagePlaceholder from '../common/ImagePlaceholder';
import './Hero.css';

export default function Hero({ onDonate, onVolunteer }) {
  return (
    <section id="home" className="hero container">
      <div className="hero__copy">
        <h1 className="hero__title">
          Together, We Can Create a <span className="hero__accent">Better Future.</span>
        </h1>
        <p className="hero__subtitle">
          Sahaay connects donations, volunteers, NGO programs and measurable impact to support
          orphaned children — so every contribution turns into a traceable outcome.
        </p>
        <div className="hero__actions">
          <button className="btn btn-primary" onClick={onDonate}>Donate Now</button>
          <button className="btn btn-secondary" onClick={onVolunteer}>Become a Volunteer</button>
        </div>
      </div>
      <div className="hero__media">
        <ImagePlaceholder label="Hero photo — children &amp; volunteers" shape="rounded" />
      </div>
    </section>
  );
}
