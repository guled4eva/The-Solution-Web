import { useCallback, useRef, useState } from "react";
import { submitToFormspree } from "../lib/forms.js";
import { isValidFormspreeEndpoint } from "../lib/config.js";

/**
 * Shared submit logic for the Formspree forms.
 * status: "idle" | "submitting" | "success" | "error" | "not-configured"
 * A ref guards against double submits (e.g. double-clicks) even before React re-renders.
 */
export function useFormSubmission(endpoint) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inFlight = useRef(false);
  const configured = isValidFormspreeEndpoint(endpoint);

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
      const result = await submitToFormspree(endpoint, payload);
      inFlight.current = false;
      if (result.ok) {
        setStatus("success");
        return true;
      }
      setStatus(result.reason === "not-configured" ? "not-configured" : "error");
      setErrorMessage(result.reason === "network" ? "network" : result.message || "");
      return false;
    },
    [endpoint, configured]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
  }, []);

  return { status, errorMessage, submit, reset, configured };
}
