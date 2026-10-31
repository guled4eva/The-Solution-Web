import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageSquareQuote } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Reveal from "../components/Reveal.jsx";
import Portrait from "../components/Portrait.jsx";
import { getInterviews } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

/** /bedrift/intervjuer – interviews with former students. */
export default function Interviews() {
  usePageTitle("Intervjuer");
  const interviews = getInterviews();

  return (
    <>
      <PageHeader
        eyebrow="Bedrift"
        title="Intervjuer"
        intro="Hvor tar en utdanning i bioteknologi og kjemi deg? Vi har spurt folk som har gått veien før deg."
      >
        <Link to="/bedrift" className="page-header__back">
          <ArrowLeft size={16} aria-hidden="true" /> Til Bedrift
        </Link>
      </PageHeader>

      <section className="section" aria-label="Alle intervjuer">
        <div className="container">
          {interviews.length > 0 ? (
            <ul className="interview-grid">
              {interviews.map((it, i) => (
                <Reveal as="li" key={it.slug} delay={(i % 3) * 80}>
                  <Link to={`/bedrift/intervjuer/${it.slug}`} className="interview-card">
                    <Portrait person={it} size={112} />
                    <h2 className="interview-card__name">{it.name}</h2>
                    <p className="interview-card__role">{[it.role, it.company].filter(Boolean).join(" – ")}</p>
                    {it.intro && <p className="interview-card__intro">{it.intro}</p>}
                    <span className="interview-card__more">
                      Les intervjuet <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={MessageSquareQuote}
              title="Intervjuer kommer snart"
              text="Vi jobber med å intervjue tidligere studenter om hvor de jobber i dag."
            />
          )}
        </div>
      </section>
    </>
  );
}
