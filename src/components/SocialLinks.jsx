import { siteConfig } from "../data/siteConfig.js";
import { isFilled } from "../lib/config.js";
import { DiscordIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons.jsx";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "discord", label: "Discord", Icon: DiscordIcon },
];

/** Returns only the social platforms that have a link in siteConfig. */
export function getConfiguredSocials() {
  return PLATFORMS.filter((p) => isFilled(siteConfig[p.key])).map((p) => ({ ...p, url: siteConfig[p.key].trim() }));
}

/** Icon links to configured social media. Renders nothing if none are configured. */
export default function SocialLinks({ variant = "light", showLabels = false }) {
  const socials = getConfiguredSocials();
  if (socials.length === 0) return null;
  return (
    <ul className={`social-links social-links--${variant}`} aria-label="Sosiale medier">
      {socials.map(({ key, label, url, Icon }) => (
        <li key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="social-links__link">
            <Icon />
            {showLabels ? <span>{label}</span> : <span className="visually-hidden">{label}</span>}
            <span className="visually-hidden"> (åpnes i ny fane)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
