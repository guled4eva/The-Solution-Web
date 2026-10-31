import { useCallback, useRef, useState } from "react";
import { submitToFormspree } from "../lib/forms.js";
import { isValidFormspreeEndpoint } from "../lib/config.js";
import { siteConfig } from "../data/siteConfig.js";
import { callScript, isValidScriptUrl } from "../lib/registrations.js";

/**
 * Shared submit logic for the forms (Forslagsboksen, kontaktskjema).
 * If the Google Apps Script is set up, messages are stored in the association's sheet and
 * shown on /admin (kind = "forslag" | "kontakt"). Otherwise Formspree is used (one e-mail each).
 * status: "idle" | "submitting" | "success" | "error" | "not-configured"
 * A ref guards against double submits (e.g. double-clicks) even before React re-renders.
 */
export function useFormSubmission(endpoint, kind) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inFlight = useRef(false);
  const scriptUrl = siteConfig.registrationScriptUrl;
  const useScript = Boolean(kind) && isValidScriptUrl(scriptUrl);
  const configured = useScript || isValidFormspreeEndpoint(endpoint);

  const submit = useCallback(
    async (payload) => {
      if (inFlight.current) return false;
      if (!configured) {
        setStatus("not-configured");
        return false;
      }
      inFlight.current = true;
      setStatus("submitting");
      setErrorMessage("");
      let result;
      if (useScript) {
        const res = await callScript(scriptUrl, { action: "message", kind, fields: payload });
        result = res?.ok
          ? { ok: true }
          : { ok: false, reason: res?.error === "network" ? "network" : "error", message: res?.error === "invalid-input" ? "Sjekk at meldingen og e-postadressen er riktig." : "" };
      } else {
        result = await submitToFormspree(endpoint, payload);
      }
      inFlight.current = false;
      if (result.ok) {
        setStatus("success");
        return true;
      }
      setStatus(result.reason === "not-configured" ? "not-configured" : "error");
      setErrorMessage(result.reason === "network" ? "network" : result.message || "");
      return false;
    },
    [endpoint, configured, useScript, scriptUrl, kind]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
  }, []);

  return { status, errorMessage, submit, reset, configured };
}
