/**
 * Arrangementer.
 * Hvert arrangement er én fil i mappen content/arrangementer/.
 * Filnavnet blir adressen: julebord-2026.json → /arrangementer/julebord-2026
 *
 * Enklest: legg til og endre arrangementer på /loggin under «Arrangementer».
 * Nettsiden sorterer selv i kommende og tidligere arrangementer.
 */
const files = import.meta.glob("../../content/arrangementer/*.json", { eager: true, import: "default" });

export const events = Object.entries(files).map(([path, data]) => ({
  ...data,
  slug: path.split("/").pop().replace(/\.json$/, ""),
}));
