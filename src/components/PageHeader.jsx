import { HexPattern } from "./ScienceArt.jsx";

/** Top band for inner pages: eyebrow, h1 and intro. */
export default function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <header className="page-header">
      <HexPattern className="page-header__pattern" opacity={0.5} size={64} />
      <div className="container page-header__inner">
        {eyebrow && (
          <p className="eyebrow eyebrow--inverse">
            <span className="eyebrow__dot" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="page-header__title">{title}</h1>
        {intro && <p className="page-header__intro">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
