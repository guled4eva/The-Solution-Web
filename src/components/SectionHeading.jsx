/** Consistent section heading with optional eyebrow label and intro text. */
export default function SectionHeading({ eyebrow, title, intro, as: Tag = "h2", align = "start", id, children }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow && (
        <p className="eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag className="section-heading__title" id={id}>
        {title}
      </Tag>
      {intro && <p className="section-heading__intro">{intro}</p>}
      {children}
    </div>
  );
}
