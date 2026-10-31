import { jobs, interviews } from "../data/industry.js";
import { isFilled } from "./config.js";

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
