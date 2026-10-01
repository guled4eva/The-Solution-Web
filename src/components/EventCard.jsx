import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import CategoryBadge from "./CategoryBadge.jsx";
import EventImage from "./EventImage.jsx";
import { dateParts, formatLongDate, isPast } from "../lib/dates.js";
import { isFilled } from "../lib/config.js";

/** Event card used on the home page and the events page. */
export default function EventCard({ event, past = false, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const parts = dateParts(event.date);
  const registrationOpen =
    !past && isFilled(event.registrationLink) && !(isFilled(event.registrationDeadline) && isPast(event.registrationDeadline));

  return (
    <article className={`event-card ${past ? "event-card--past" : ""}`}>
      <div className="event-card__media">
        <EventImage event={event} />
        {parts && (
          <div className="event-card__date" aria-hidden="true">
            <span className="event-card__day">{parts.day}</span>
            <span className="event-card__month">{parts.month}</span>
          </div>
        )}
      </div>

      <div className="event-card__body">
        <div className="event-card__tags">
          <CategoryBadge category={event.category} />
          {event.placeholder && <span className="badge badge--example">Eksempel</span>}
        </div>

        <Heading className="event-card__title">
          <Link to={`/arrangementer/${event.slug}`} className="event-card__link">
            {event.title}
          </Link>
        </Heading>

        <ul className="event-meta">
          <li>
            <span className="visually-hidden">Dato: </span>
            <time dateTime={event.date}>{formatLongDate(event.date)}</time>
          </li>
          {isFilled(event.time) && (
            <li>
              <Clock size={16} aria-hidden="true" />
              <span className="visually-hidden">Tid: </span>
              {event.time}
            </li>
          )}
          {isFilled(event.location) && (
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span className="visually-hidden">Sted: </span>
              {event.location}
            </li>
          )}
        </ul>

        {event.description && <p className="event-card__desc">{event.description}</p>}

        <div className="event-card__actions">
          <span className="event-card__more" aria-hidden="true">
            Les mer <ArrowRight size={16} />
          </span>
          {registrationOpen && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--accent btn--sm event-card__register"
            >
              Meld deg på
              <span className="visually-hidden"> til {event.title} (åpnes i ny fane)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
