import type { ServiceSlug } from "@/lib/services";

export type BookableService = {
  slug: ServiceSlug;
  name: string;
  durationMinutes: number;
  blurb: string;
  paymentNote?: string;
  /** Set once a slot should be paid for at booking time via Stripe Checkout. */
  amountCents?: number;
  intake: { id: string; label: string; helper?: string; long?: boolean; required?: boolean }[];
};

export const BOOKABLE: BookableService[] = [
  {
    slug: "clarity-call",
    name: "Clarity Call",
    durationMinutes: 30,
    blurb: "Thirty minutes on your score, and the one fix that pays back fastest.",
    intake: [
      {
        id: "goal",
        label: "What would make this call worth your time?",
        helper: "One sentence is plenty.",
        long: true,
        required: true,
      },
      {
        id: "links",
        label: "Where can we see you online?",
        helper: "Website, Instagram, Google listing, whatever you have.",
      },
      { id: "sells", label: "What do you sell, and to whom?", long: true },
    ],
  },
  {
    slug: "strategy-consult",
    name: "2-Hour Strategy Consult",
    durationMinutes: 120,
    blurb: "Two hours on your offer, pricing, pages and follow up, ending with a build plan.",
    paymentNote:
      "Card payment turns on once our payment account is live. For now we hold your time and invoice you.",
    amountCents: 20000,
    intake: [
      { id: "goal", label: "What do you want decided by the end?", long: true, required: true },
      {
        id: "revenue",
        label: "Roughly what do you bring in each month?",
        helper: "A range is fine.",
      },
      { id: "links", label: "Where can we see you online?" },
      { id: "blockers", label: "What have you already tried that did not work?", long: true },
    ],
  },
];

export function bookableBySlug(slug: string): BookableService | undefined {
  return BOOKABLE.find((s) => s.slug === slug);
}

/** Podcast guest slots: booked publicly, with no sign-in and no score required. */
export const PODCAST_BOOKABLE: BookableService[] = [
  {
    slug: "podcast-street",
    name: "Street-style interview",
    durationMinutes: 45,
    blurb: "A short, on-the-street conversation, guided so you never freeze.",
    amountCents: 15000,
    intake: [],
  },
  {
    slug: "podcast-longform",
    name: "Long-form episode",
    durationMinutes: 180,
    blurb: "A full sit-down episode, half a day of filming with proper sound and lighting.",
    amountCents: 200000,
    intake: [],
  },
];

export function podcastBookableBySlug(slug: string): BookableService | undefined {
  return PODCAST_BOOKABLE.find((s) => s.slug === slug);
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "America/New_York",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export function formatDay(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function formatTime(iso: string) {
  return `${timeFormat.format(new Date(iso))} New York time`;
}

export function formatWhen(iso: string) {
  return `${formatDay(iso)}, ${timeFormat.format(new Date(iso))} New York time`;
}
