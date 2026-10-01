/**
 * Turns a path from the data files (e.g. "/images/styret/leder.jpg") into a URL
 * that works no matter where the site is hosted (domain root or /repo-name/).
 * External URLs are returned unchanged.
 */
export function assetUrl(path) {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  const base = import.meta.env.BASE_URL || "/";
  return base.replace(/\/?$/, "/") + path.replace(/^\.?\//, "");
}
