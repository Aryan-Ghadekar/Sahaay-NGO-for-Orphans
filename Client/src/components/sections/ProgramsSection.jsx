import Reveal from '../common/Reveal';
import EventCard from './EventCard';
import './ProgramsSection.css';

export default function ProgramsSection({ ongoing, upcoming }) {
  return (
    <section id="programs" className="programs container">
      <Reveal><h2 className="section-title programs__heading">Ongoing Events</h2></Reveal>
      <div className="programs__grid">
        {ongoing.map((event, i) => (
          <Reveal delay={i * 80} key={event.id}><EventCard event={event} /></Reveal>
        ))}
      </div>

      <Reveal><h2 className="section-title programs__heading">Upcoming Events</h2></Reveal>
      <div className="programs__grid">
        {upcoming.map((event, i) => (
          <Reveal delay={i * 80} key={event.id}><EventCard event={event} /></Reveal>
        ))}
      </div>
    </section>
  );
}
