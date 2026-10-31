import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ExternalLink, MapPin } from "lucide-react";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";
import { formatShortDate } from "../lib/dates.js";
import { daysLeft } from "../lib/industry.js";

export function deadlineText(deadline, fallback) {
  if (!deadline) return fallback ? `Frist: ${fallback}` : "Løpende søknadsfrist";
  const left = daysLeft(deadline);
  const date = formatShortDate(String(deadline).slice(0, 10));
  if (left === 0) return `Frist i dag (${date})`;
  if (left === 1) return `Frist i morgen (${date})`;
  if (left !== null && left <= 14) return `Frist ${date} · ${left} dager igjen`;
  return `Frist ${date}`;
}

/** One job posting. The card opens the job page on our site; «Søk» goes straight to the application. */
export default function JobCard({ job, compact = false }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const urgent = job.deadline && daysLeft(job.deadline) !== null && daysLeft(job.deadline) <= 7;
  const href = isFilled(job.link) ? job.link.trim() : null;
  const page = `/bedrift/jobber/${job.slug}`;

  return (
    <article className={`job-card ${compact ? "job-card--compact" : ""}`} id={job.slug}>
      <div className="job-card__logo" aria-hidden="true">
        {isFilled(job.logo) && !logoFailed ? (
          <img src={assetUrl(job.logo)} alt="" loading="lazy" onError={() => setLogoFailed(true)} />
        ) : (
          <span>{String(job.company || "?").trim().charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="job-card__body">
        <p className="job-card__company">{job.company}</p>
        <h3 className="job-card__title">
          <Link to={page} className="job-card__link">
            {job.title}
          </Link>
        </h3>
        <ul className="job-card__meta">
          {job.field && (
            <li className={`job-card__field job-card__field--${job.field.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{job.field}</li>
          )}
          {job.type && <li className="job-card__type">{job.type}</li>}
          {(job.location || job.county) && (
            <li>
              <MapPin size={15} aria-hidden="true" /> {[job.location, job.county && job.county !== job.location ? job.county : ""].filter(Boolean).join(", ")}
            </li>
          )}
          <li className={urgent ? "is-urgent" : undefined}>
            <CalendarClock size={15} aria-hidden="true" /> {deadlineText(job.deadline, job.deadlineText)}
          </li>
        </ul>
        {!compact && job.description && <p className="job-card__desc">{job.description}</p>}
        {!compact && job.source === "nav" && <p className="job-card__source">Fra arbeidsplassen.nav.no</p>}
      </div>
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className="job-card__cta">
          Søk <ExternalLink size={16} aria-hidden="true" />
          <span className="visually-hidden"> på {job.title} hos {job.company} (åpnes i ny fane)</span>
        </a>
      )}
    </article>
  );
}
