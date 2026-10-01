/**
 * Helpers for reading optional values from the data files.
 * A value counts as "missing" when it is empty or still an obvious
 * placeholder such as "[LEGG INN E-POST]".
 */
export function isFilled(value) {
  if (typeof value !== "string") return Boolean(value);
  const v = value.trim();
  return v.length > 0 && !(v.startsWith("[") && v.endsWith("]"));
}

export const isDev = import.meta.env.DEV;

/** Accepts only real Formspree form endpoints, never anything secret-looking. */
export function isValidFormspreeEndpoint(value) {
  return isFilled(value) && /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+\/?$/.test(value.trim());
}
