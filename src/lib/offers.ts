import type { AreaKey } from "@/lib/score-rubric";

export type OfferKind = "build" | "podcast" | "tutorial" | "community";

export type Offer = {
  id: string;
  kind: OfferKind;
  title: string;
  blurb: string;
  /** Which weak areas this helps with */
  areas: AreaKey[];
  /** Score range this suits */
  minScore: number;
  maxScore: number;
  /** What she does next. Live links only; null means we set it up on the call. */
  href: string | null;
  ctaLabel: string;
  note?: string;
};

export const OFFER_KINDS: Record<OfferKind, { label: string; line: string }> = {
  build: { label: "Built for you", line: "We build it, you keep it." },
  podcast: { label: "Podcast", line: "Your story, told properly." },
  tutorial: { label: "Free tutorial", line: "Do it yourself, step by step." },
  community: { label: "Community", line: "Other women doing the same work." },
};

export const OFFERS: Offer[] = [
  // Builds
  {
    id: "found-online",
    kind: "build",
    title: "The Found Online build",
    blurb:
      "Your own site on your own domain, your Google profile completed, and one page written for the exact thing you sell in the place you sell it.",
    areas: ["source", "clarity"],
    minScore: 0,
    maxScore: 69,
    href: null,
    ctaLabel: "Talk this through on your call",
  },
  {
    id: "booking-engine",
    kind: "build",
    title: "The Booked Solid build",
    blurb:
      "Real booking, card payment, instant replies, confirmations and reminders, so she can book and pay while you are with a client.",
    areas: ["land"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Talk this through on your call",
  },
  {
    id: "proof-engine",
    kind: "build",
    title: "The Proof build",
    blurb:
      "Automatic review requests after every job, your reviews shown on your page, and named results written up as proof.",
    areas: ["attract", "clarity"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Talk this through on your call",
  },
  {
    id: "compounding-build",
    kind: "build",
    title: "The Compounding build",
    blurb:
      "A monthly rhythm of published work, a list you actually email, follow up that sends itself, and numbers you can read at a glance.",
    areas: ["elevate", "attract"],
    minScore: 55,
    maxScore: 100,
    href: null,
    ctaLabel: "Talk this through on your call",
  },

  // Podcast
  {
    id: "podcast-guest",
    kind: "podcast",
    title: "Be a guest on the show",
    blurb:
      "One honest conversation about how you built this. It becomes video, audio and clips you can use anywhere, and it is the fastest proof you will ever own.",
    areas: ["attract"],
    minScore: 40,
    maxScore: 100,
    href: null,
    ctaLabel: "Ask about a guest spot",
  },
  {
    id: "podcast-story",
    kind: "podcast",
    title: "Your founder story, filmed",
    blurb:
      "A short filmed story about why you started, cut for your own page and your socials, so people meet you before they meet your prices.",
    areas: ["clarity", "attract"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Ask about filming",
  },

  // Tutorials
  {
    id: "tutorial-google",
    kind: "tutorial",
    title: "Fix your Google profile in an hour",
    blurb:
      "Free walkthrough: the right category, hours, services, photos that get clicks, and the questions section most women leave empty.",
    areas: ["source"],
    minScore: 0,
    maxScore: 84,
    href: null,
    ctaLabel: "Get the walkthrough",
    note: "Coming to the tutorial library shortly.",
  },
  {
    id: "tutorial-first-line",
    kind: "tutorial",
    title: "Write the first line of your page",
    blurb:
      "Free walkthrough: turn a slogan into a sentence that says what you do, for whom, and where, in under twenty minutes.",
    areas: ["clarity"],
    minScore: 0,
    maxScore: 84,
    href: null,
    ctaLabel: "Get the walkthrough",
    note: "Coming to the tutorial library shortly.",
  },
  {
    id: "tutorial-reviews",
    kind: "tutorial",
    title: "Get ten reviews this month",
    blurb:
      "Free walkthrough: the message to send, when to send it, and how to make the ask part of finishing the job.",
    areas: ["attract"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Get the walkthrough",
    note: "Coming to the tutorial library shortly.",
  },
  {
    id: "tutorial-followup",
    kind: "tutorial",
    title: "Follow up without feeling pushy",
    blurb:
      "Free walkthrough: three messages for the people who went quiet, written so they sound like you.",
    areas: ["elevate", "land"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Get the walkthrough",
    note: "Coming to the tutorial library shortly.",
  },

  // Community
  {
    id: "community-circle",
    kind: "community",
    title: "The Build With Her circle",
    blurb:
      "Women running real businesses, comparing what works, sharing suppliers and clients, and keeping each other publishing.",
    areas: ["elevate", "attract", "source", "clarity", "land"],
    minScore: 0,
    maxScore: 100,
    href: null,
    ctaLabel: "Ask for an invite",
    note: "Invitations go out with your clarity call.",
  },
];

/**
 * Picks the offers that fit her score and her weakest areas.
 * Weakest areas come first, then one community option is always kept.
 */
export function offersFor(
  total: number,
  areaScores: { area: AreaKey; earned: number; outOf: number }[],
  limit = 5,
): Offer[] {
  const ranked = [...areaScores]
    .map((row) => ({ area: row.area, pct: row.outOf ? row.earned / row.outOf : 0 }))
    .sort((a, b) => a.pct - b.pct);

  const weight = new Map<AreaKey, number>();
  ranked.forEach((row, index) => weight.set(row.area, ranked.length - index));

  const eligible = OFFERS.filter((o) => total >= o.minScore && total <= o.maxScore);

  const scored = eligible
    .map((offer) => {
      const areaWeight = offer.areas.reduce((sum, area) => sum + (weight.get(area) ?? 0), 0);
      return { offer, weight: areaWeight / Math.max(1, offer.areas.length) };
    })
    .sort((a, b) => b.weight - a.weight);

  const picked: Offer[] = [];
  const kinds = new Set<OfferKind>();

  // One of each kind first, so she sees a build, a podcast, a tutorial and the community
  for (const row of scored) {
    if (kinds.has(row.offer.kind)) continue;
    picked.push(row.offer);
    kinds.add(row.offer.kind);
    if (picked.length >= limit) return picked;
  }
  for (const row of scored) {
    if (picked.includes(row.offer)) continue;
    picked.push(row.offer);
    if (picked.length >= limit) break;
  }
  return picked;
}
