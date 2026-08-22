import ImagePlaceholder from '../common/ImagePlaceholder';
import './EventCard.css';

export default function EventCard({ event }) {
  const isUpcoming = event.status === 'Upcoming';
  return (
    <div className="event-card card card-hover">
      <div className="event-card__media">
        <ImagePlaceholder label="Event photo" shape="rect" />
      </div>
      <div className="event-card__body">
        <span className={`tag ${isUpcoming ? 'tag-outline' : 'tag-sage'}`}>{event.status}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__desc">{event.description}</p>
        <p className="event-card__meta">{event.meta}</p>
        {event.impact && <p className="event-card__meta">{event.impact}</p>}
        <button className="btn btn-secondary btn-sm">
          {isUpcoming ? 'View Event' : 'View Details'}
        </button>
      </div>
    </div>
  );
}
