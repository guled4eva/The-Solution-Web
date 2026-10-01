import { isValidFormspreeEndpoint } from "./config.js";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Sends form data to a Formspree endpoint.
 * Returns { ok: true } or { ok: false, reason: "not-configured" | "network" | "server", message }.
 * No secrets are involved: a Formspree form endpoint is meant to be public.
 */
export async function submitToFormspree(endpoint, payload) {
  if (!isValidFormspreeEndpoint(endpoint)) {
    return { ok: false, reason: "not-configured" };
  }
  try {
    const response = await fetch(endpoint.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { ok: true };
    let message = "";
    try {
      const data = await response.json();
      if (Array.isArray(data?.errors)) message = data.errors.map((e) => e.message).join(" ");
    } catch {
      /* ignore non-JSON responses */
    }
    return { ok: false, reason: "server", message };
  } catch {
    return { ok: false, reason: "network" };
  }
}
