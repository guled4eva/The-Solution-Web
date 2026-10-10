/** Date helpers. All dates in the data files are "YYYY-MM-DD" in Norwegian local time. */

/**
 * Accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:MM" (written by hand) and full ISO
 * timestamps such as "2026-11-08T23:00:00.000Z" (written by the editor at /loggin).
 * A date without a time counts as the end of that day (23:59).
 */
export function parseLocalDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(text);
  if (match) {
    const [, y, m, d, hh = "23", mm = "59"] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const iso = new Date(text);
  if (Number.isNaN(iso.getTime())) return null;
  // Exactly midnight UTC means "a date without a time" → that calendar date.
  if (/T00:00(:00(\.0+)?)?(Z|[+-]00:?00)$/.test(text)) {
    return new Date(iso.getUTCFullYear(), iso.getUTCMonth(), iso.getUTCDate(), 23, 59);
  }
  // Midnight local time from the date picker also means "no time chosen".
  if (iso.getHours() === 0 && iso.getMinutes() === 0) iso.setHours(23, 59);
  return iso;
}

function hasTimeOfDay(value) {
  const d = parseLocalDate(value);
  if (!d) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) return false;
  return !(d.getHours() === 23 && d.getMinutes() === 59);
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
  const hasTime = hasTimeOfDay(value);
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
