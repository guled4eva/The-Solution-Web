import { events as rawEvents } from "../data/events.js";
import { isUpcomingDate, parseLocalDate } from "./dates.js";
import { isFilled } from "./config.js";

export const CATEGORIES = ["Sosialt", "Faglig", "Bedrift", "Generalforsamling", "Annet"];

/** Makes a URL-friendly slug, handling Norwegian letters. */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortKey(event) {
  // Date plus start time (first "HH:MM" found in the time field)
  const time = /(\d{1,2}):(\d{2})/.exec(event.time || "");
  const d = parseLocalDate(event.date);
  if (!d) return 0;
  d.setHours(time ? Number(time[1]) : 0, time ? Number(time[2]) : 0);
  return d.getTime();
}

/** Clean, validated list of events. Invalid entries are skipped with a warning in development. */
export const allEvents = (() => {
  const seen = new Set();
  const list = [];
  rawEvents.forEach((event, index) => {
    if (!event || !event.title || !parseLocalDate(event.date)) {
      if (import.meta.env.DEV) {
        console.warn(`[events.js] Arrangement nr. ${index + 1} mangler tittel eller har ugyldig dato (bruk ÅÅÅÅ-MM-DD).`, event);
      }
      return;
    }
    let slug = slugify(isFilled(event.slug) ? event.slug : event.title) || `arrangement-${index + 1}`;
    if (seen.has(slug)) {
      if (import.meta.env.DEV) console.warn(`[events.js] Slug "${slug}" er brukt flere ganger.`);
      slug = `${slug}-${index + 1}`;
    }
    seen.add(slug);
    list.push({
      ...event,
      slug,
      category: CATEGORIES.includes(event.category) ? event.category : "Annet",
    });
  });
  return list;
})();

export function getUpcomingEvents() {
  return allEvents.filter((e) => isUpcomingDate(e.date)).sort((a, b) => sortKey(a) - sortKey(b));
}

export function getPastEvents() {
  return allEvents.filter((e) => !isUpcomingDate(e.date)).sort((a, b) => sortKey(b) - sortKey(a));
}

export function getEventBySlug(slug) {
  return allEvents.find((e) => e.slug === slug);
}
