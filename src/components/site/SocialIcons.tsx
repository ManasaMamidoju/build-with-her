type IconProps = { className?: string };

/**
 * Minimal line-style social marks, drawn to match the RoseMark stroke weight
 * rather than pulled from an icon library (lucide-react ships no TikTok mark).
 */

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.3v5.4l4.7-2.7-4.7-2.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M7.7 10.2v6" />
      <circle cx="7.7" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.3 16.2v-3.4c0-1.5 1-2.6 2.3-2.6 1.3 0 2.2 1 2.2 2.6v3.4" />
      <path d="M11.3 10.2v6" />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 3v10.5a3.3 3.3 0 1 1-3.3-3.3c.3 0 .6 0 .9.1" />
      <path d="M14 3c.3 2.3 1.9 3.9 4.2 4.2" />
    </svg>
  );
}
