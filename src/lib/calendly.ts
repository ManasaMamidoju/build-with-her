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

/**
 * Beauty Weekend price: the same 2-hour strategy call at $50 (usually $200),
 * paid through Stripe inside Calendly. Only handed out by the BEAUTY code
 * unlock on the bingo results page, until the weekend ends.
 */
export const CALENDLY_BEAUTY_STRATEGY_LINK =
  "https://calendly.com/mamidoju-manasa/build-with-her-2-hr-strategy-call-beauty";

export type CalendlyBookableSlug = keyof typeof CALENDLY_LINKS;

export function calendlyLinkFor(slug: string): string | undefined {
  return CALENDLY_LINKS[slug as CalendlyBookableSlug];
}
