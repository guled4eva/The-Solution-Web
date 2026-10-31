/**
 * Shows the text of a job ad: blank line = new paragraph, lines starting with «•» = bullet list,
 * a short line on its own (no full stop) = small heading.
 */
export default function AdText({ text }) {
  const blocks = String(text || "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className="ad-text">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => l.startsWith("•"))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^•\s*/, "")}</li>
              ))}
            </ul>
          );
        }
        if (lines.length === 1 && lines[0].length <= 60 && !/[.!?:]$/.test(lines[0])) {
          return <h3 key={i}>{lines[0]}</h3>;
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {l}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
