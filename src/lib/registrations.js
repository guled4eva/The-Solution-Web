import { isFilled } from "./config.js";

/**
 * Talks to the Google Apps Script that stores sign-ups in the association's
 * Google Sheet (see google-apps-script/Pamelding.gs and README.md).
 * The script URL is public; the /admin password is checked inside the script
 * and is never stored in the website code.
 */

export function isValidScriptUrl(value) {
  return isFilled(value) && /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\/?$/.test(value.trim());
}

/**
 * POSTs to the script. Uses a plain-text body so the browser sends a "simple"
 * request (Apps Script does not answer CORS preflight requests).
 * Returns the script's JSON, or { ok: false, error: "network" }.
 */
export async function callScript(url, payload) {
  try {
    const response = await fetch(url.trim(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) return { ok: false, error: "server-error" };
    return await response.json();
  } catch {
    return { ok: false, error: "network" };
  }
}

export const DIET_OPTIONS = [
  { key: "halal", label: "Halal" },
  { key: "vegan", label: "Vegansk" },
  { key: "nuts", label: "Nøtteallergi" },
  { key: "other", label: "Annet" },
];

/** Human-readable diet summary for one registration, e.g. "Halal, Annet: laktose". */
export function dietText(r) {
  const parts = DIET_OPTIONS.filter((o) => r[o.key]).map((o) =>
    o.key === "other" && r.otherText ? `Annet: ${r.otherText}` : o.label
  );
  return parts.join(", ");
}
