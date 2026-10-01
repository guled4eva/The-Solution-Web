/** Date helpers. All dates in the data files are "YYYY-MM-DD" in Norwegian local time. */

export function parseLocalDate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(String(value).trim());
  if (!match) return null;
  const [, y, m, d, hh = "23", mm = "59"] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** An event stays "upcoming" for the whole day it takes place. */
export function isUpcomingDate(value) {
  const date = parseLocalDate(value);
  if (!date) return false;
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return day >= startOfToday();
}

const longFormat = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric" });
const monthFormat = new Intl.DateTimeFormat("nb-NO", { month: "short" });

export function formatLongDate(value) {
  const d = parseLocalDate(value);
  if (!d) return value || "";
  const text = longFormat.format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(value) {
  const d = parseLocalDate(value);
  return d ? shortFormat.format(d) : value || "";
}

export function dateParts(value) {
  const d = parseLocalDate(value);
  if (!d) return null;
  return { day: dayFormat.format(d).replace(".", ""), month: monthFormat.format(d).replace(".", "") };
}

/** "2026-11-09" or "2026-11-09T12:00" → readable deadline text. */
export function formatDeadline(value) {
  const d = parseLocalDate(value);
  if (!d) return value || "";
  const hasTime = /T\d{2}:\d{2}$/.test(value);
  const datePart = shortFormat.format(d);
  return hasTime
    ? `${datePart} kl. ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    : datePart;
}

export function isPast(value) {
  const d = parseLocalDate(value);
  return d ? d < new Date() : false;
}

export function yearOf(value) {
  const d = parseLocalDate(value);
  return d ? d.getFullYear() : "";
}
