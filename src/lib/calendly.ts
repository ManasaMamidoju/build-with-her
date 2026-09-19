/**
 * Live Calendly scheduling links. These two calls now run on Calendly end to
 * end (including payment for the Strategy Consult), bypassing our own
 * booking engine — Calendly's own custom questions already capture the
 * Findability Score, revenue and lead-source data our booking form used to.
 */
export const CALENDLY_LINKS = {
  "clarity-call": "https://calendly.com/mamidoju-manasa/clarity-call-30",
  "strategy-consult": "https://calendly.com/mamidoju-manasa/build-with-her-2h-strategy",
} as const;

export type CalendlyBookableSlug = keyof typeof CALENDLY_LINKS;

export function calendlyLinkFor(slug: string): string | undefined {
  return CALENDLY_LINKS[slug as CalendlyBookableSlug];
}
