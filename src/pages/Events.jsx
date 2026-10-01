import { History } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import EventCard from "../components/EventCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { getPastEvents, getUpcomingEvents } from "../lib/events.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function Events() {
  usePageTitle("Arrangementer");
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <>
      <PageHeader
        eyebrow="Arrangementer"
        title="Arrangementer"
        intro="Fra faglige arrangementer til sosiale kvelder – her finner du det som skjer i The Solution."
      />

      <section className="section" aria-labelledby="kommende">
        <div className="container">
          <SectionHeading id="kommende" title="Kommende arrangementer">
            {upcoming.length > 0 && (
              <p className="count-pill">
                {upcoming.length} {upcoming.length === 1 ? "arrangement" : "arrangementer"}
              </p>
            )}
          </SectionHeading>
          {upcoming.length > 0 ? (
            <ul className="event-grid">
              {upcoming.map((event, i) => (
                <Reveal as="li" key={event.slug} delay={(i % 3) * 80}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Ingen kommende arrangementer akkurat nå"
              text="Følg med – nye arrangementer kommer snart!"
            />
          )}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="tidligere">
        <div className="container">
          <SectionHeading id="tidligere" title="Tidligere arrangementer" />
          {past.length > 0 ? (
            <ul className="event-grid event-grid--past">
              {past.map((event) => (
                <li key={event.slug}>
                  <EventCard event={event} past />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={History}
              title="Ingen tidligere arrangementer ennå"
              text="Her samler vi arrangementene etter hvert som de har funnet sted."
            />
          )}
        </div>
      </section>
    </>
  );
}
