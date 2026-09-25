import type { AreaKey } from "@/lib/score-rubric";
import { AREAS, AREA_ORDER, bandFor, petalStateFor } from "@/lib/score-rubric";

/**
 * Findability Bingo, the 5x5 card handed out at Beauty Weekend (SEO to Sale
 * workshop). Columns are the SCALE areas, left to right. Square wording
 * matches the printed card exactly, so what she ticks on paper she can tick
 * here.
 *
 * Scored squares carry the area's points between them (Source 25, Clarity 18,
 * Attract 25, Land 17, Elevate 15 = 100). Mystery squares and FREE never
 * score: they only count toward a BINGO line.
 */

export type FixTag = "SEO" | "AEO" | "GEO";

export type BingoSquare =
  | {
      id: string;
      kind: "scored";
      area: AreaKey;
      label: string;
      points: number;
      fix: { title: string; how: string; tags: FixTag[] };
    }
  | {
      id: string;
      kind: "mystery";
      area: AreaKey;
      number: 1 | 2 | 3;
      /** Revealed wording, shown on the results page once she has submitted. */
      reveal: string;
      /** Only used to order the fix list: mystery squares never add points. */
      priority: number;
      fix: { title: string; how: string; tags: FixTag[] };
    }
  | { id: "free"; kind: "free"; area: AreaKey; label: string; sublabel: string };

const sq = (
  id: string,
  area: AreaKey,
  label: string,
  points: number,
  fix: { title: string; how: string; tags: FixTag[] },
): BingoSquare => ({ id, kind: "scored", area, label, points, fix });

/** Row-major, 5 rows of 5, exactly as printed. */
export const BINGO_GRID: BingoSquare[][] = [
  [
    sq("gbp_updated", "source", "Google Business Profile updated this month", 8, {
      title: "Post to your Google Business Profile every week",
      how: "Add one real photo and one short update (a service, a result, an opening) every week. Fresh profiles rank higher in the map pack and get quoted by AI answers.",
      tags: ["SEO", "GEO"],
    }),
    sq("bio_who", "clarity", "Your bio says exactly who you serve", 4, {
      title: "Rewrite your bio to name who you serve",
      how: "One line: what you do + who it is for + where. Example: 'Lash lifts for busy moms in Coral Gables.' Use the same line on every profile so search and AI tools connect them.",
      tags: ["SEO", "AEO"],
    }),
    sq("posted_work", "attract", "Posted your real work this week", 6, {
      title: "Post real client work every week",
      how: "One real result a week, with a caption that names the service and the neighborhood. Real work is what people and algorithms trust.",
      tags: ["GEO"],
    }),
    sq("book_online", "land", "Clients can book online, any time of day", 6, {
      title: "Let clients book online 24/7",
      how: "Set up an online booking page (Calendly, Square, Vagaro, GlossGenius) and put it on your site, Google profile and every bio. Every 'DM me to book' loses people at night.",
      tags: ["SEO"],
    }),
    {
      id: "mystery_2",
      kind: "mystery",
      area: "elevate",
      number: 2,
      reveal: "Me or my client posted a testimonial on social media this month.",
      priority: 5,
      fix: {
        title: "Get one testimonial posted every month",
        how: "Ask one happy client a month for a short video or story and repost it. Fresh testimonials show search engines and AI tools that people are talking about you right now.",
        tags: ["GEO", "AEO"],
      },
    },
  ],
  [
    {
      id: "mystery_1",
      kind: "mystery",
      area: "source",
      number: 1,
      reveal: "My business shows up on ChatGPT, Gemini, or Google.",
      priority: 9,
      fix: {
        title: "Get your business into AI answers (ChatGPT, Gemini, Google AI)",
        how: "Ask ChatGPT and Gemini 'best [your service] in [your city]'. If you are missing, make your name, service and city match everywhere (site, Google, Yelp, bios), add an FAQ page and collect reviews that mention your service by name.",
        tags: ["AEO", "GEO"],
      },
    },
    sq("services_priced", "clarity", "Every service has a clear description and price", 4, {
      title: "Give every service its own description and price",
      how: "List each service with what's included, how long it takes and a starting price. Searchers and AI assistants skip businesses they cannot quote.",
      tags: ["SEO", "AEO"],
    }),
    sq("before_after", "attract", "Before-and-after photos online", 7, {
      title: "Put before-and-after photos on your site and Google profile",
      how: "Upload them to your website and Google Business Profile, not only Instagram. Name the files and write alt text with the service and city (e.g. 'balayage-miami-before-after.jpg').",
      tags: ["SEO", "GEO"],
    }),
    {
      id: "mystery_3",
      kind: "mystery",
      area: "land",
      number: 3,
      reveal: "My booking, reminders, and follow-ups run without me.",
      priority: 6,
      fix: {
        title: "Automate your booking reminders and follow-ups",
        how: "Turn on automatic confirmation and reminder texts/emails, plus a 'how was it? leave a review' message the day after. Fewer no-shows, more reviews, no extra hours.",
        tags: ["GEO"],
      },
    },
    sq("review_qr", "elevate", "Review QR code in your space", 4, {
      title: "Put a Google review QR code where clients check out",
      how: "Print your Google review link as a QR code and place it at the mirror, front desk or on your receipt. Reviews are the #1 local ranking signal you control.",
      tags: ["SEO", "GEO"],
    }),
  ],
  [
    sq("ask_heard", "source", "You ask every client how they heard about you", 5, {
      title: "Ask every new client how they found you",
      how: "Add 'How did you hear about us?' to your booking form. In a month you'll know which channel to double down on.",
      tags: ["SEO"],
    }),
    sq("dream_client", "clarity", "You can describe your dream client in one sentence", 3, {
      title: "Write your dream client in one sentence",
      how: "Who, what problem, where. Put it at the top of your homepage and bios. It is the sentence AI tools repeat when they recommend you.",
      tags: ["AEO"],
    }),
    {
      id: "free",
      kind: "free",
      area: "attract",
      label: "FREE",
      sublabel: "You showed up today",
    },
    sq("booking_bio", "land", "Booking link in your bio", 4, {
      title: "Put your booking link in every bio",
      how: "Instagram, TikTok, Facebook and Google: link straight to booking, not to a link tree with 12 options.",
      tags: ["SEO"],
    }),
    sq("ask_reviews", "elevate", "You ask happy clients for a review", 5, {
      title: "Ask every happy client for a Google review",
      how: "Send your review link by text right after the appointment and ask them to mention the service by name. Reviews with keywords help you rank and get cited by AI.",
      tags: ["SEO", "GEO", "AEO"],
    }),
  ],
  [
    sq("yelp", "source", "Listed and up to date on Yelp", 5, {
      title: "Claim and complete your Yelp listing",
      how: "Same name, address, phone, hours and services as your Google profile. ChatGPT and Apple Maps pull from Yelp, so a missing listing hides you from AI answers.",
      tags: ["SEO", "GEO", "AEO"],
    }),
    sq("neighborhood", "clarity", "Your website names your neighborhood", 3, {
      title: "Name your city and neighborhood on your website",
      how: "Put '[service] in [neighborhood], [city]' in your homepage title, first heading and footer. Local searches match on exactly these words.",
      tags: ["SEO", "GEO"],
    }),
    sq("reddit", "attract", "Answered a real question on Reddit or a forum", 5, {
      title: "Answer one real question on Reddit or a forum each week",
      how: "Find your city's subreddit or a beauty forum and give a genuinely helpful answer. AI assistants cite Reddit heavily, so helpful answers become recommendations.",
      tags: ["AEO", "GEO"],
    }),
    sq("dm_reply", "land", "You reply to DMs within a day", 3, {
      title: "Reply to every DM within a day",
      how: "Set up quick replies with your price range and booking link so every inquiry gets an answer, even on busy days.",
      tags: ["GEO"],
    }),
    sq("photo_spot", "elevate", "A photo spot with your handle on it", 2, {
      title: "Create a photo spot with your handle on it",
      how: "A mirror decal, neon sign or backdrop with your @handle. Every client photo becomes a tagged post that sends people back to you.",
      tags: ["GEO"],
    }),
  ],
  [
    sq("know_source", "source", "You know where your top clients found you", 7, {
      title: "Track where your best clients came from",
      how: "List your top 10 clients and where each one found you. Spend next month's energy on the channel that brought the most.",
      tags: ["SEO"],
    }),
    sq("faq", "clarity", "FAQ page with your clients' real questions", 4, {
      title: "Add an FAQ page with your clients' real questions",
      how: "Write the 10 questions clients actually ask (price, how long, aftercare, parking) and answer each in 2 to 3 sentences. This is the #1 way to get quoted by ChatGPT and Google's AI answers.",
      tags: ["AEO", "SEO"],
    }),
    sq("featured", "attract", "Featured on a podcast, blog, or local article", 7, {
      title: "Get featured on a podcast, blog or local article",
      how: "Pitch one local blog, podcast or news site a month. Links from other sites are what tell Google, and AI tools, that you are the real deal.",
      tags: ["SEO", "GEO", "AEO"],
    }),
    sq("follow_up", "land", "You follow up with people who asked but didn't book", 4, {
      title: "Follow up with everyone who asked but didn't book",
      how: "A simple 2-message follow-up (next day, one week) turns 'just looking' into bookings. Automate it so it happens every time.",
      tags: ["GEO"],
    }),
    sq("referral", "elevate", "A reward for clients who refer a friend", 4, {
      title: "Offer a reward for referrals",
      how: "Give clients a simple reason to send friends: $10 off, a free add-on. Word of mouth is the findability channel that compounds.",
      tags: ["GEO"],
    }),
  ],
];

export const BINGO_SQUARES: BingoSquare[] = BINGO_GRID.flat();

export const SCORED_SQUARES = BINGO_SQUARES.filter(
  (s): s is Extract<BingoSquare, { kind: "scored" }> => s.kind === "scored",
);
export const MYSTERY_SQUARES = BINGO_SQUARES.filter(
  (s): s is Extract<BingoSquare, { kind: "mystery" }> => s.kind === "mystery",
);

export const BINGO_IDS = BINGO_SQUARES.map((s) => s.id);

/** All 12 winning lines: 5 rows, 5 columns, 2 diagonals, as index lists into the flat grid. */
const LINES: number[][] = [
  ...[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...[0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function isChecked(checked: Record<string, boolean>, square: BingoSquare) {
  return square.kind === "free" ? true : Boolean(checked[square.id]);
}

/** Which squares sit on a completed line, and how many lines there are. */
export function bingoLines(checked: Record<string, boolean>) {
  const done = LINES.filter((line) => line.every((i) => isChecked(checked, BINGO_SQUARES[i]!)));
  const onLine = new Set<string>();
  for (const line of done) for (const i of line) onLine.add(BINGO_SQUARES[i]!.id);
  return { count: done.length, onLine };
}

export type BingoFix = {
  squareId: string;
  area: AreaKey;
  title: string;
  how: string;
  tags: FixTag[];
};

export type BingoScore = {
  total: number;
  areaScores: { area: AreaKey; earned: number; outOf: number }[];
  petals: AreaKey[];
  thorns: AreaKey[];
  band: ReturnType<typeof bandFor>;
  bingos: number;
  fixes: BingoFix[];
};

export const MAX_FIXES = 10;
export const MIN_FIXES = 5;

/** Extra steps for high scorers, so the result always has at least five things to do. */
const ADVANCED_FIXES: BingoFix[] = [
  {
    squareId: "adv_schema",
    area: "source",
    title: "Add LocalBusiness schema to your website",
    how: "Structured data tells Google and AI tools your name, services, hours, prices and reviews in a format they read directly.",
    tags: ["SEO", "AEO"],
  },
  {
    squareId: "adv_service_pages",
    area: "clarity",
    title: "Give each main service its own page",
    how: "One page per service, each with its own title, price, photos and FAQs. Each page is another way to be found.",
    tags: ["SEO", "AEO"],
  },
  {
    squareId: "adv_directories",
    area: "source",
    title: "Match your details across every directory",
    how: "Apple Maps, Bing Places, Yelp, Facebook and beauty directories should all show the exact same name, address and phone.",
    tags: ["SEO", "GEO"],
  },
  {
    squareId: "adv_video",
    area: "attract",
    title: "Turn your best reels into YouTube Shorts with captions",
    how: "YouTube is the second-biggest search engine, and Google shows Shorts in results. Say your service and city out loud in the video.",
    tags: ["SEO", "GEO"],
  },
  {
    squareId: "adv_llms",
    area: "clarity",
    title: "Publish a plain-language 'about us' AI tools can quote",
    how: "One short paragraph: who you are, what you do, for whom, where, since when and what makes you different. AI answers quote pages like this word for word.",
    tags: ["AEO", "GEO"],
  },
];

export function scoreBingo(checked: Record<string, boolean>): BingoScore {
  const earned = Object.fromEntries(AREA_ORDER.map((a) => [a, 0])) as Record<AreaKey, number>;
  for (const s of SCORED_SQUARES) if (checked[s.id]) earned[s.area] += s.points;

  const areaScores = AREA_ORDER.map((area) => ({
    area,
    earned: earned[area],
    outOf: AREAS[area].points,
  }));
  const total = Math.max(
    0,
    Math.min(
      100,
      areaScores.reduce((sum, a) => sum + a.earned, 0),
    ),
  );

  const missing: (BingoFix & { weight: number })[] = [];
  for (const s of BINGO_SQUARES) {
    if (s.kind === "free" || checked[s.id]) continue;
    missing.push({
      squareId: s.id,
      area: s.area,
      ...s.fix,
      weight: s.kind === "scored" ? s.points : s.priority,
    });
  }
  let fixes: BingoFix[] = missing
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_FIXES)
    .map(({ weight: _weight, ...fix }) => fix);
  if (fixes.length < MIN_FIXES) {
    fixes = [...fixes, ...ADVANCED_FIXES].slice(0, MIN_FIXES);
  }

  return {
    total,
    areaScores,
    petals: areaScores
      .filter((a) => petalStateFor(a.earned, a.outOf) === "petal")
      .map((a) => a.area),
    thorns: areaScores
      .filter((a) => petalStateFor(a.earned, a.outOf) === "thorn")
      .map((a) => a.area),
    band: bandFor(total),
    bingos: bingoLines(checked).count,
    fixes,
  };
}

/* Beauty Weekend offer --------------------------------------------------- */

export const BEAUTY_CODE = "BEAUTY";
/** Beauty Weekend runs Sep 25-27, 2026. The $50 price ends Sunday 11:59pm New York time (EDT, UTC-4). */
export const BEAUTY_ENDS_AT = new Date("2026-09-28T03:59:59.999Z");
export const BEAUTY_ENDS_LABEL = "Sunday, September 27 at 11:59pm ET";

export function beautyOfferLive(now = new Date()) {
  return now.getTime() <= BEAUTY_ENDS_AT.getTime();
}

export const BINGO_SOURCE = "beauty-weekend-bingo";

/** Shown next to the checkboxes, and saved word for word with each submission as proof of consent. */
export const CONSENT_COPY = {
  email:
    "Yes, send me marketing emails from Build With Her Media about events, offers and tips. I can unsubscribe any time. (Your score is emailed to you either way.)",
  sms: "Yes, send me marketing and reminder text messages from Build With Her Media at the number above, including automated texts. Consent is not a condition of purchase. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.",
  terms: "I agree to the Terms and the Privacy Notice.",
} as const;
