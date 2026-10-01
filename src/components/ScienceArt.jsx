import { useId } from "react";

/* Decorative science graphics. All are aria-hidden: they carry no information. */

/** Faint hexagonal lattice used as a background texture. */
export function HexPattern({ className = "", opacity = 0.12, size = 56 }) {
  const id = useId().replace(/:/g, "");
  const h = size * 0.433; // half the hexagon height (side = size / 2)
  return (
    <svg className={`hex-pattern ${className}`} aria-hidden="true" focusable="false" width="100%" height="100%">
      <defs>
        <pattern id={`hex-${id}`} width={size * 1.5} height={h * 2} patternUnits="userSpaceOnUse">
          <path
            d={`M${size * 0.25} 0 L${size * 0.75} 0 L${size} ${h} L${size * 0.75} ${h * 2} L${size * 0.25} ${h * 2} L0 ${h} Z M${size} ${h} L${size * 1.5} ${h}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#hex-${id})`} opacity={opacity} />
    </svg>
  );
}

const ring = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

/**
 * Hero illustration: an aromatic ring with side chains, with a slot in the
 * middle for the logo. Lines draw themselves once on load (unless reduced motion).
 */
export function MoleculeHero({ children }) {
  const outer = ring(260, 260, 128);
  const inner = ring(260, 260, 104);
  const shorten = (a, b, t = 0.16) => [
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t],
  ];
  const doubleBonds = [0, 2, 4].map((i) => shorten(inner[i], inner[(i + 1) % 6]));

  // Side chains: [from vertex index, points...]
  const chains = [
    [0, [260, 64], [330, 24]],
    [1, [452, 180], [500, 252]],
    [3, [260, 456]],
    [4, [86, 352], [40, 300]],
    [5, [92, 160]],
  ];

  return (
    <div className="molecule-hero" aria-hidden="true">
      <svg viewBox="0 0 540 520" className="molecule-hero__svg" focusable="false">
        <circle cx="260" cy="260" r="214" className="mh-orbit" />
        <circle cx="260" cy="260" r="246" className="mh-orbit mh-orbit--faint" />
        <polygon points={outer.map((p) => p.join(",")).join(" ")} className="mh-bond mh-draw" />
        {doubleBonds.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="mh-bond mh-bond--thin mh-draw" />
        ))}
        {chains.map(([v, ...pts], i) => {
          const all = [outer[v], ...pts];
          return <polyline key={i} points={all.map((p) => p.join(",")).join(" ")} className="mh-bond mh-draw" />;
        })}
        {outer.map(([x, y], i) => (
          <circle key={`v${i}`} cx={x} cy={y} r="7" className="mh-node" />
        ))}
        {chains.flatMap(([, ...pts], i) =>
          pts.map(([x, y], j) => (
            <circle
              key={`c${i}-${j}`}
              cx={x}
              cy={y}
              r={j === pts.length - 1 ? 12 : 8}
              className={`mh-node ${i === 1 && j === 1 ? "mh-node--accent" : ""} ${i === 3 && j === 1 ? "mh-node--green" : ""}`}
            />
          ))
        )}
        <text x="352" y="20" className="mh-label">OH</text>
        <text x="474" y="292" className="mh-label">NH₂</text>
      </svg>
      <div className="molecule-hero__center">{children}</div>
    </div>
  );
}

/** Small decorative "bond" divider: a line with nodes. */
export function BondDivider({ className = "" }) {
  return (
    <svg className={`bond-divider ${className}`} viewBox="0 0 160 16" aria-hidden="true" focusable="false">
      <line x1="8" y1="8" x2="152" y2="8" />
      <line x1="56" y1="3" x2="104" y2="3" />
      <circle cx="8" cy="8" r="4" />
      <circle cx="56" cy="8" r="4" />
      <circle cx="104" cy="8" r="4" className="accent" />
      <circle cx="152" cy="8" r="4" />
    </svg>
  );
}

/** Flask illustration for the 404 page. */
export function EmptyFlask() {
  return (
    <svg viewBox="0 0 200 220" className="empty-flask" aria-hidden="true" focusable="false">
      <path d="M78 20h44M86 20v58L36 176a18 18 0 0 0 16 26h96a18 18 0 0 0 16-26L114 78V20" className="flask-outline" />
      <path d="M58 140h84l20 38a10 10 0 0 1-9 15H47a10 10 0 0 1-9-15Z" className="flask-liquid" />
      <circle cx="92" cy="160" r="5" className="flask-bubble" />
      <circle cx="112" cy="174" r="3.5" className="flask-bubble" />
      <circle cx="104" cy="118" r="4" className="flask-bubble flask-bubble--float" />
      <text x="100" y="66" textAnchor="middle" className="flask-q">?</text>
    </svg>
  );
}
