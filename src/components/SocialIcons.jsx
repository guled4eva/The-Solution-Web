/* Brand icons drawn inline (Lucide no longer ships brand logos). */
const common = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" };

export function InstagramIcon(props) {
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <svg {...common} fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.6 4.77 6v5.55h-4v-4.92c0-1.17-.02-2.68-1.66-2.68-1.66 0-1.92 1.29-1.92 2.6v5h-3.97v-11Z" />
    </svg>
  );
}

export function DiscordIcon(props) {
  return (
    <svg {...common} fill="currentColor" {...props}>
      <path d="M19.6 5.3A17.3 17.3 0 0 0 15.3 4l-.55 1.1a16 16 0 0 0-5.5 0L8.7 4a17.2 17.2 0 0 0-4.3 1.3C1.7 9.4 1 13.4 1.3 17.3a17.4 17.4 0 0 0 5.3 2.7l1.1-1.8a11 11 0 0 1-1.8-.86l.44-.34a12.4 12.4 0 0 0 11.3 0l.44.34c-.57.33-1.18.62-1.8.86l1.1 1.8a17.3 17.3 0 0 0 5.3-2.7c.43-4.5-.73-8.5-3-12ZM8.5 14.9c-1.05 0-1.9-.96-1.9-2.14s.84-2.15 1.9-2.15c1.07 0 1.92.97 1.9 2.15 0 1.18-.84 2.14-1.9 2.14Zm7 0c-1.05 0-1.9-.96-1.9-2.14s.84-2.15 1.9-2.15c1.07 0 1.92.97 1.9 2.15 0 1.18-.83 2.14-1.9 2.14Z" />
    </svg>
  );
}
