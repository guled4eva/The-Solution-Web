import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, ExternalLink, MapPin } from "lucide-react";
import AdText from "../components/AdText.jsx";
import FormStatus from "../components/FormStatus.jsx";
import { deadlineText } from "../components/JobCard.jsx";
import NotFound from "./NotFound.jsx";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";
import { formatShortDate } from "../lib/dates.js";
import { getJobBySlug, isJobOpen } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

/** /bedrift/jobber/:slug – the whole job ad on our site, with a button straight to the application. */
export default function JobDetail() {
  const { slug } = useParams();
  const job = getJobBySlug(slug);
  usePageTitle(job ? `${job.title} – ${job.company}` : "Fant ikke stillingen");
  const [logoFailed, setLogoFailed] = useState(false);
  if (!job) return <NotFound />;

  const open = isJobOpen(job);
  const start = /^\d{4}-\d{2}-\d{2}$/.test(job.start || "") ? formatShortDate(job.start) : job.start;
  const facts = [
    ["Fagområde", job.field],
    ["Stillingstittel", job.jobtitle],
    ["Type ansettelse", job.engagement || job.type],
    ["Antall stillinger", job.positions],
    ["Sted", [job.location, job.county && job.county !== job.location ? job.county : ""].filter(Boolean).join(", ")],
    ["Oppstart", start],
    ["Søknadsfrist", job.deadline ? formatShortDate(String(job.deadline).slice(0, 10)) : job.deadlineText || "Løpende"],
    ["Sektor", job.sector],
  ].filter(([, v]) => isFilled(v));

  const apply = isFilled(job.link) ? job.link : null;

  return (
    <article className="section job-detail">
      <div className="container">
        <Link to="/bedrift/jobber" className="text-link interview__back">
          <ArrowLeft size={16} aria-hidden="true" /> Alle stillinger
        </Link>

        <header className="job-detail__head">
          <div className="job-card__logo job-detail__logo" aria-hidden="true">
            {isFilled(job.logo) && !logoFailed ? (
              <img src={assetUrl(job.logo)} alt="" onError={() => setLogoFailed(true)} />
            ) : (
              <span>{String(job.company || "?").trim().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="job-card__company">{job.company}</p>
            <h1 className="job-detail__title">{job.title}</h1>
            <ul className="job-card__meta">
              {job.field && (
                <li className={`job-card__field job-card__field--${job.field.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{job.field}</li>
              )}
              {job.type && <li className="job-card__type">{job.type}</li>}
              {job.location && (
                <li>
                  <MapPin size={15} aria-hidden="true" /> {job.location}
                </li>
              )}
              <li>
                <CalendarClock size={15} aria-hidden="true" /> {deadlineText(job.deadline, job.deadlineText)}
              </li>
            </ul>
          </div>
        </header>

        {!open && (
          <FormStatus type="info" title="Søknadsfristen har gått ut">
            <p>
              Denne stillingen er ikke lenger åpen. <Link to="/bedrift/jobber">Se ledige stillinger</Link>.
            </p>
          </FormStatus>
        )}

        <div className="job-detail__layout">
          <div className="job-detail__main">
            {isFilled(job.body) ? <AdText text={job.body} /> : <AdText text={job.description} />}

            {isFilled(job.employerInfo) && (
              <section className="job-detail__employer">
                <h2>Om bedriften</h2>
                <AdText text={job.employerInfo} />
              </section>
            )}
          </div>

          <aside className="job-detail__aside">
            <div className="job-detail__box">
              <h2 className="visually-hidden">Om jobben</h2>
              <dl className="job-detail__facts">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {apply && open && (
                <a href={apply} target="_blank" rel="noreferrer" className="btn btn--accent btn--lg job-detail__apply">
                  <span>Søk på stillingen</span>
                  <ExternalLink size={18} aria-hidden="true" />
                </a>
              )}
              {isFilled(job.adUrl) && job.adUrl !== apply && (
                <a href={job.adUrl} target="_blank" rel="noreferrer" className="text-link job-detail__source">
                  Se annonsen på arbeidsplassen.nav.no <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
