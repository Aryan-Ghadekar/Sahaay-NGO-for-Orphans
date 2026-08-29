import Photo from '../common/Photo';
import Reveal from '../common/Reveal';
import { photos } from '../../assets/photos';
import './VolunteerCta.css';

export default function VolunteerCta({ onDonate, image }) {
  return (
    <section id="volunteer" className="volunteer-cta container">
      <Reveal className="volunteer-cta__media">
        <Photo src={image || photos.volunteerWithChildren} alt="A Sahaay volunteer with children from the program" shape="rounded" />
      </Reveal>
      <Reveal delay={100}>
        <h2 className="volunteer-cta__title">Your contribution can become an opportunity.</h2>
        <p className="volunteer-cta__body">
          See where your support can make a difference — every rupee is tracked from donation to
          program to measurable outcome.
        </p>
        <button className="btn btn-primary" onClick={onDonate}>Donate Now</button>
      </Reveal>
    </section>
  );
}
