import { siteConfig } from "../data/siteConfig.js";
import { isValidScriptUrl } from "./registrations.js";

/*
 * Anonymous visit counting.
 * No cookies, no IP addresses, no personal data – only: which page, the date,
 * and where the visitor came from (Google, Instagram, a link, directly …).
 * The counts are stored in the "Besøk" tab of the Google Sheet and shown on /admin.
 */

const SOURCE_KEY = "ts-visit-source";
const ADMIN_KEY = "ts-admin-password";

const SEARCH = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/ecosia\.org$/, "Ecosia"],
  [/kvasir\.no$/, "Kvasir"],
  [/(^|\.)yandex\./, "Yandex"],
];
const SOCIAL = [
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "Facebook"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)snapchat\.com$/, "Snapchat"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "X (Twitter)"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)discord(app)?\.com$/, "Discord"],
];

/** Works out where a visitor came from. Exported for tests. */
export function classifySource(referrer, search, ownHost) {
  const utm = new URLSearchParams(search || "").get("utm_source");
  if (utm && utm.trim()) return { channel: "Kampanje", source: utm.trim().toLowerCase().slice(0, 40) };

  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase().replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (!host || host === (ownHost || "").replace(/^www\./, "")) return { channel: "Direkte", source: "Direkte" };
  for (const [re, name] of SEARCH) if (re.test(host)) return { channel: "Søk", source: name };
  for (const [re, name] of SOCIAL) if (re.test(host)) return { channel: "Sosiale medier", source: name };
  return { channel: "Lenke", source: host };
}

function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function send(url, payload) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: "text/plain;charset=utf-8" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(url, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body }).catch(
    () => {}
  );
}

/** Counts one page view. Called on every route change. */
export function trackPageView(pathname) {
  if (import.meta.env.DEV) return;
  const url = siteConfig.registrationScriptUrl;
  if (!isValidScriptUrl(url)) return;
  if (typeof navigator !== "undefined" && navigator.webdriver) return; // bots / automated browsers
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (/^\/(admin|loggin)(\/|$)/.test(path)) return;

  const store = storage();
  if (store?.getItem(ADMIN_KEY)) return; // the board's own visits are not counted

  let saved = null;
  try {
    saved = JSON.parse(store?.getItem(SOURCE_KEY) || "null");
  } catch {
    saved = null;
  }
  const newSession = !saved;
  if (newSession) {
    saved = classifySource(document.referrer, window.location.search, window.location.hostname);
    try {
      store?.setItem(SOURCE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }
  send(url.trim(), { action: "visit", path, channel: saved.channel, source: saved.source, newSession });
}
