import { Link } from "react-router-dom";

/**
 * Button that renders as a router link (`to`), an external/document link (`href`)
 * or a regular <button>. Variants: primary, secondary, accent, ghost, inverse.
 */
export default function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "end",
  newTab = false,
  className = "",
  children,
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  const content = (
    <>
      {Icon && iconPosition === "start" && <Icon className="btn__icon" aria-hidden="true" size={18} />}
      <span>{children}</span>
      {Icon && iconPosition === "end" && <Icon className="btn__icon" aria-hidden="true" size={18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    const tabProps = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
      <a href={href} className={classes} {...tabProps} {...rest}>
        {content}
        {newTab && <span className="visually-hidden"> (åpnes i ny fane)</span>}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
