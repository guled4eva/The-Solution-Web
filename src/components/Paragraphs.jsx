/** Renders text from the content files; a blank line starts a new paragraph. */
export default function Paragraphs({ text, className }) {
  const parts = String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.map((p, i) => (
    <p key={i} className={className}>
      {p}
    </p>
  ));
}
