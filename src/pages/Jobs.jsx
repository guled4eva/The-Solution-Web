import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, GraduationCap } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import JobCard from "../components/JobCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { FIELDS, getOpenJobs } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const SORTS = {
  frist: { label: "Snarest frist", fn: (a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")) },
  nyeste: { label: "Nyeste først", fn: (a, b) => String(b.published || "").localeCompare(String(a.published || "")) },
  bedrift: { label: "Bedrift A–Å", fn: (a, b) => String(a.company).localeCompare(String(b.company), "nb") },
};

/** /bedrift/jobber – open positions for bachelor graduates, filterable by field and type. */
export default function Jobs() {
  usePageTitle("Ledige stillinger");
  const jobs = getOpenJobs();
  const [params, setParams] = useSearchParams();
  const field = FIELDS.includes(params.get("fag")) ? params.get("fag") : "";
  const [type, setType] = useState("");
  const [sort, setSort] = useState("frist");

  const inField = field ? jobs.filter((j) => j.field === field) : jobs;
  const types = useMemo(() => [...new Set(inField.map((j) => j.type).filter(Boolean))], [inField]);
  const shown = (type ? inField.filter((j) => j.type === type) : inField).slice().sort(SORTS[sort].fn);

  const setField = (f) => {
    setType("");
    setParams(f ? { fag: f } : {}, { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="Bedrift"
        title="Ledige stillinger"
        intro="Stillinger innen bioteknologi, analytisk kjemi og prosessteknologi som passer for deg med en bachelorgrad – eller snart har en."
      >
        <Link to="/bedrift" className="page-header__back">
          <ArrowLeft size={16} aria-hidden="true" /> Til Bedrift
        </Link>
      </PageHeader>

      <section className="section" aria-label="Stillinger">
        <div className="container">
          <div className="job-fields" role="group" aria-label="Fagområde">
            <button type="button" className={`job-field ${!field ? "is-active" : ""}`} aria-pressed={!field} onClick={() => setField("")}>
              <span className="job-field__name">Alle fagområder</span>
              <span className="job-field__count">{jobs.length}</span>
            </button>
            {FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                className={`job-field job-field--${slug(f)} ${field === f ? "is-active" : ""}`}
                aria-pressed={field === f}
                onClick={() => setField(f)}
              >
                <span className="job-field__name">{f}</span>
                <span className="job-field__count">{jobs.filter((j) => j.field === f).length}</span>
              </button>
            ))}
          </div>

          <div className="job-toolbar">
            {types.length > 1 ? (
              <div className="filter-chips" role="group" aria-label="Type stilling">
                <button type="button" className={`filter-chip ${type === "" ? "is-active" : ""}`} aria-pressed={type === ""} onClick={() => setType("")}>
                  Alle typer
                </button>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`filter-chip ${type === t ? "is-active" : ""}`}
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                  >
                    {t} ({inField.filter((j) => j.type === t).length})
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <label className="job-sort">
              <span>Sorter:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="field__control">
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="job-note">
            <GraduationCap size={16} aria-hidden="true" /> Bare stillinger som passer for bachelorgrad. Stillinger med krav om master eller doktorgrad er tatt bort.
          </p>

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
              title={field ? `Ingen ledige stillinger innen ${field.toLowerCase()} akkurat nå` : "Ingen ledige stillinger akkurat nå"}
              text="Listen oppdateres automatisk hver uke – følg også med på Instagram."
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

function slug(s) {
  return s.toLowerCase().replace(/[^a-z]+/g, "-");
}
