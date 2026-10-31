import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import JobCard from "../components/JobCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { getOpenJobs } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

/** /bedrift/jobber – open positions, filterable by type. Expired ones are hidden automatically. */
export default function Jobs() {
  usePageTitle("Ledige stillinger");
  const jobs = getOpenJobs();
  const types = useMemo(() => [...new Set(jobs.map((j) => j.type).filter(Boolean))], [jobs]);
  const [type, setType] = useState("");
  const shown = type ? jobs.filter((j) => j.type === type) : jobs;

  return (
    <>
      <PageHeader
        eyebrow="Bedrift"
        title="Ledige stillinger"
        intro="Sommerjobber, internships og stillinger som passer for studenter og nyutdannede innen bioteknologi og kjemi."
      >
        <Link to="/bedrift" className="page-header__back">
          <ArrowLeft size={16} aria-hidden="true" /> Til Bedrift
        </Link>
      </PageHeader>

      <section className="section" aria-label="Stillinger">
        <div className="container">
          {types.length > 1 && (
            <div className="filter-chips" role="group" aria-label="Filtrer etter type">
              <button type="button" className={`filter-chip ${type === "" ? "is-active" : ""}`} aria-pressed={type === ""} onClick={() => setType("")}>
                Alle ({jobs.length})
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-chip ${type === t ? "is-active" : ""}`}
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                >
                  {t} ({jobs.filter((j) => j.type === t).length})
                </button>
              ))}
            </div>
          )}

          {shown.length > 0 ? (
            <ul className="job-list">
              {shown.map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="Ingen ledige stillinger akkurat nå"
              text="Nye stillinger legges ut her fortløpende – følg også med på Instagram."
            >
              <Link to="/bedrift#samarbeid" className="text-link">
                Er du bedrift og vil annonsere en stilling? Ta kontakt.
              </Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
