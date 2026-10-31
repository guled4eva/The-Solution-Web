import { jobs, interviews } from "../data/industry.js";
import { isFilled } from "./config.js";

/** The three fields jobs are sorted into (same names as in the editor and the NAV import). */
export const FIELDS = ["Bioteknologi", "Analytisk kjemi", "Prosessteknologi"];

/** Norwegian counties (2024–) used for the «Sted» filter. */
export const COUNTIES = [
  "Oslo", "Akershus", "Østfold", "Buskerud", "Innlandet", "Vestfold", "Telemark", "Agder", "Rogaland",
  "Vestland", "Møre og Romsdal", "Trøndelag", "Nordland", "Troms", "Finnmark", "Utlandet",
];

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Jobs that are still open, soonest deadline first (no deadline = «løpende», last). */
export function getOpenJobs() {
  const today = todayKey();
  return jobs
    .filter((j) => isFilled(j.title) && isFilled(j.company))
    .filter((j) => !j.deadline || String(j.deadline).slice(0, 10) >= today)
    .sort((a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")));
}

/** Newest interview first. */
export function getInterviews() {
  return interviews
    .filter((i) => isFilled(i.name))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

/** Any job by its address (also expired ones, so old links show a clear message). */
export function getJobBySlug(slug) {
  return jobs.find((j) => j.slug === slug && isFilled(j.title));
}

export function isJobOpen(job) {
  return !job.deadline || String(job.deadline).slice(0, 10) >= todayKey();
}

export function getInterviewBySlug(slug) {
  return getInterviews().find((i) => i.slug === slug);
}

/** Days left until a deadline (0 = today), or null. */
export function daysLeft(deadline) {
  if (!deadline) return null;
  const [y, m, d] = String(deadline).slice(0, 10).split("-").map(Number);
  const end = new Date(y, m - 1, d);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end - start) / 86400000);
}
