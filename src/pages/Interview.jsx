import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Paragraphs from "../components/Paragraphs.jsx";
import Portrait from "../components/Portrait.jsx";
import NotFound from "./NotFound.jsx";
import { formatShortDate } from "../lib/dates.js";
import { getInterviewBySlug } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

/** /bedrift/intervjuer/:slug – one interview, as questions and answers. */
export default function Interview() {
  const { slug } = useParams();
  const it = getInterviewBySlug(slug);
  usePageTitle(it ? `Intervju: ${it.name}` : "Fant ikke intervjuet");
  if (!it) return <NotFound />;
  const qa = Array.isArray(it.qa) ? it.qa.filter((q) => q && q.question) : [];

  return (
    <article className="section interview">
      <div className="container interview__inner">
        <Link to="/bedrift/intervjuer" className="text-link interview__back">
          <ArrowLeft size={16} aria-hidden="true" /> Alle intervjuer
        </Link>

        <header className="interview__head">
          <Portrait person={it} size={150} />
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              Intervju
            </p>
            <h1 className="interview__name">{it.name}</h1>
            <p className="interview__role">{[it.role, it.company].filter(Boolean).join(" – ")}</p>
            {it.graduated && <p className="interview__meta">{it.graduated}</p>}
          </div>
        </header>

        {it.intro && <p className="interview__lead">{it.intro}</p>}

        <div className="interview__qa">
          {qa.map((q, i) => (
            <section key={i} className="interview__item">
              <h2 className="interview__question">{q.question}</h2>
              <div className="prose prose--lines">
                <Paragraphs text={q.answer} />
              </div>
            </section>
          ))}
        </div>

        {it.date && <p className="interview__date">Publisert {formatShortDate(String(it.date).slice(0, 10))}</p>}
      </div>
    </article>
  );
}
