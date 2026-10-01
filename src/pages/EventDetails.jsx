import { useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Timer } from "lucide-react";
import Button from "../components/Button.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import EventImage from "../components/EventImage.jsx";
import NotFound from "./NotFound.jsx";
import { getEventBySlug } from "../lib/events.js";
import { formatDeadline, formatLongDate, isPast, isUpcomingDate } from "../lib/dates.js";
import { isFilled } from "../lib/config.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function EventDetails() {
  const { slug } = useParams();
  const event = getEventBySlug(slug);
  usePageTitle(event ? event.title : "Fant ikke arrangementet");

  if (!event) return <NotFound />;

  const upcoming = isUpcomingDate(event.date);
  const hasDeadline = isFilled(event.registrationDeadline);
  const deadlinePassed = hasDeadline && isPast(event.registrationDeadline);
  const canRegister = upcoming && isFilled(event.registrationLink) && !deadlinePassed;
  const paragraphs = String(event.fullDescription || event.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="event-detail">
      <div className="event-detail__top">
        <div className="container">
          <Button to="/arrangementer" variant="ghost" icon={ArrowLeft} iconPosition="start" className="event-detail__back">
            Tilbake til arrangementer
          </Button>
        </div>
      </div>

      <div className="container event-detail__layout">
        <div className="event-detail__main">
          <div className="event-detail__tags">
            <CategoryBadge category={event.category} />
            {!upcoming && <span className="badge badge--muted">Tidligere arrangement</span>}
            {event.placeholder && <span className="badge badge--example">Eksempel</span>}
          </div>
          <h1 className="event-detail__title">{event.title}</h1>

          <div className="event-detail__image">
            <EventImage event={event} large />
          </div>

          <div className="prose">
            {paragraphs.length > 0 ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p>Mer informasjon kommer.</p>}
          </div>
        </div>

        <aside className="event-detail__aside" aria-label="Praktisk informasjon">
          <div className="info-card">
            <h2 className="info-card__title">Praktisk info</h2>
            <dl className="info-list">
              <div>
                <dt>
                  <CalendarDays size={18} aria-hidden="true" /> Dato
                </dt>
                <dd>
                  <time dateTime={event.date}>{formatLongDate(event.date)}</time>
                </dd>
              </div>
              {isFilled(event.time) && (
                <div>
                  <dt>
                    <Clock size={18} aria-hidden="true" /> Tid
                  </dt>
                  <dd>{event.time}</dd>
                </div>
              )}
              {isFilled(event.location) && (
                <div>
                  <dt>
                    <MapPin size={18} aria-hidden="true" /> Sted
                  </dt>
                  <dd>{event.location}</dd>
                </div>
              )}
              {hasDeadline && (
                <div>
                  <dt>
                    <Timer size={18} aria-hidden="true" /> Påmeldingsfrist
                  </dt>
                  <dd>
                    {formatDeadline(event.registrationDeadline)}
                    {deadlinePassed && upcoming && <span className="info-list__note"> – fristen har gått ut</span>}
                  </dd>
                </div>
              )}
            </dl>

            {canRegister && (
              <Button href={event.registrationLink} newTab variant="accent" icon={ExternalLink} className="info-card__cta">
                Meld deg på
              </Button>
            )}
            {upcoming && !canRegister && !deadlinePassed && (
              <p className="info-card__hint">Ingen påmeldingslenke er lagt ut for dette arrangementet.</p>
            )}
            {upcoming && deadlinePassed && <p className="info-card__hint">Påmeldingen er stengt.</p>}
            {!upcoming && <p className="info-card__hint">Dette arrangementet har allerede funnet sted.</p>}
          </div>
        </aside>
      </div>
    </article>
  );
}
