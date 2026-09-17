export type ServiceSlug =
  | "clarity-call"
  | "strategy-consult"
  | "automation-build"
  | "bootcamp"
  | "podcast-street"
  | "podcast-longform"
  | "custom-offer";

export type Service = {
  slug: ServiceSlug;
  name: string;
  step: string;
  price: string;
  priceNote?: string;
  duration: string;
  summary: string;
  bestFor: string;
  includes: string[];
  requires: string[];
  faqs: { q: string; a: string }[];
  /** What she does next. Booking and payment go live in the next phase. */
  ctaLabel: string;
  ctaNote: string;
  waitlist?: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "clarity-call",
    name: "Clarity Call",
    step: "Start here",
    price: "Free",
    duration: "30 to 60 minutes",
    summary:
      "We read your Findability Score together, name the one thing costing you the most money, and decide what you fix first.",
    bestFor: "Any woman who has taken the score and wants a plan she can act on this week.",
    includes: [
      "A read of your score, area by area, in plain words",
      "The single fix that pays back fastest for your business",
      "A written next step in your inbox after the call",
      "An honest answer on whether you need us at all",
    ],
    requires: ["Your Findability Score, so we are not guessing"],
    faqs: [
      {
        q: "Is this a sales call?",
        a: "It is a working call. If a paid build is the right answer we will say so, and if free tools will do the job we will say that instead.",
      },
      {
        q: "What if I have no website yet?",
        a: "That is common and it is fine. We will start from what you already have, even if that is one social account.",
      },
    ],
    ctaLabel: "Book your Clarity Call",
    ctaNote: "Booking opens shortly. Take the score first and we will hold your place.",
  },
  {
    slug: "strategy-consult",
    name: "2-Hour Strategy Consult",
    step: "Go deeper",
    price: "$200",
    priceNote: "Paid when you book",
    duration: "2 hours",
    summary:
      "Two focused hours on your offer, your pricing, your pages and your follow up, ending with a build plan you own whether you hire us or not.",
    bestFor:
      "A woman who already sells something and wants a sharp plan rather than someone to do the work.",
    includes: [
      "A rewrite of how you describe what you sell",
      "Your pricing and packages reviewed against what clients already pay you",
      "A page-by-page map of what to publish and in what order",
      "The recording and the written plan, yours to keep",
    ],
    requires: ["Your Findability Score", "Payment when you book"],
    faqs: [
      {
        q: "Can we split it into two sessions?",
        a: "Yes. Most women do one hour, go and try things, then come back for the second hour.",
      },
      {
        q: "Does the fee come off a build?",
        a: "Yes. If you start a build within 30 days, the $200 comes off the build price.",
      },
    ],
    ctaLabel: "Book your strategy consult",
    ctaNote: "Payment and booking open shortly. Take the score and we will invite you first.",
  },
  {
    slug: "automation-build",
    name: "Automation Build",
    step: "We build it",
    price: "From $3,500",
    priceNote: "Pay in full or split it",
    duration: "4 to 6 weeks",
    summary:
      "We build the machine: the site, the booking, the payment, the replies, the reminders and the follow up, then hand you the keys.",
    bestFor:
      "A woman losing bookings to slow replies, missed messages and work she is doing by hand.",
    includes: [
      "Your site on your own domain, written for the thing you sell",
      "Booking and card payment that work while you are with a client",
      "Instant replies, confirmations and reminders that cut no-shows",
      "Review requests after every job, shown as proof on your pages",
      "A walkthrough recording and one month of support after handover",
    ],
    requires: ["A Clarity Call first", "An accepted offer before we start"],
    faqs: [
      {
        q: "Do I own everything at the end?",
        a: "Yes. The domain, the site, the accounts and the data are in your name from day one.",
      },
      {
        q: "Can I pay in instalments?",
        a: "Yes. Builds can be split, and every build is invoiced so you have a record for your books.",
      },
      {
        q: "Can you add a podcast to a build?",
        a: "Yes, and it is the most common addition. We film once and it feeds your pages for months.",
      },
    ],
    ctaLabel: "Start with a Clarity Call",
    ctaNote: "Builds start after a call, so we quote the real job and not a guess.",
  },
  {
    slug: "bootcamp",
    name: "Bootcamp",
    step: "Learn to run it",
    price: "$2,500",
    priceNote: "Waitlist only",
    duration: "5 to 6 weeks, live",
    summary:
      "Five to six weeks, live and in a small group, where you build your own machine with us beside you and leave knowing how to run it.",
    bestFor:
      "A woman who would rather learn the system than hand it over, and who can give it a few hours a week.",
    includes: [
      "Live weekly sessions in a small group, recorded for you",
      "Your own site, booking and follow up built during the weeks",
      "Templates, prompts and checklists you keep using afterwards",
      "The other women in your cohort, who stay in touch after",
    ],
    requires: ["Your Findability Score", "A few hours a week for five to six weeks"],
    faqs: [
      {
        q: "When is the next cohort?",
        a: "Dates are set once the waitlist is full enough to run a small group. Join the waitlist and you hear before it is public.",
      },
      {
        q: "What if I cannot make a live session?",
        a: "Every session is recorded and you can send questions in before or after.",
      },
    ],
    ctaLabel: "Join the bootcamp waitlist",
    ctaNote: "No payment now. We email you before dates are announced anywhere else.",
    waitlist: true,
  },
  {
    slug: "podcast-street",
    name: "Podcast, street style",
    step: "Be seen",
    price: "$150",
    duration: "About 30 minutes of your day",
    summary:
      "A short, sharp on-the-street conversation about your work, edited into clips built to travel.",
    bestFor: "A woman who wants to be on camera without booking out half a day.",
    includes: [
      "One short filmed conversation, guided so you never freeze",
      "Edited vertical clips with captions",
      "Your name, your business and your link in the description",
      "Posted on our channels and yours to reuse anywhere",
    ],
    requires: ["Nothing but a date and something you want people to know"],
    faqs: [
      {
        q: "I hate being on camera.",
        a: "Most women say that first. We ask the questions, keep it short, and cut anything you do not like.",
      },
      {
        q: "Where does it get posted?",
        a: "On our podcast channels, and you get the files to post yourself.",
      },
    ],
    ctaLabel: "Ask about a street-style spot",
    ctaNote: "Applications open shortly. Take the score and we will contact you when they do.",
  },
  {
    slug: "podcast-longform",
    name: "Podcast, long form",
    step: "Be known",
    price: "$2,000",
    duration: "Half a day filming",
    summary:
      "A full sit-down episode about your business, cut into a long episode plus a run of clips and one street-style piece.",
    bestFor:
      "A woman with a story, results and a reason for clients to trust her over everyone else.",
    includes: [
      "A full filmed episode with proper sound and lighting",
      "Five to six edited clips plus one street-style piece",
      "An episode page on our site that links to yours",
      "Captions, titles and descriptions written for search",
    ],
    requires: ["A short application so we can plan the episode"],
    faqs: [
      {
        q: "Do I need to prepare?",
        a: "We send the questions ahead and talk them through before filming, so nothing is a surprise.",
      },
      {
        q: "Can this be part of a build?",
        a: "Yes, and it works better that way, because the episode has somewhere to send people.",
      },
    ],
    ctaLabel: "Ask about a long-form episode",
    ctaNote: "Applications open shortly. Take the score and we will contact you when they do.",
  },
  {
    slug: "custom-offer",
    name: "Custom work",
    step: "For clients already with us",
    price: "Quoted",
    duration: "Depends on the job",
    summary:
      "Extra work for women we already build for: another system, another campaign, another season of content.",
    bestFor: "Existing clients with a job that does not fit the list above.",
    includes: [
      "A written offer with the scope, the price and the dates",
      "One link to accept and pay",
      "An invoice for your records",
    ],
    requires: ["Work with us already"],
    faqs: [
      {
        q: "How do I ask for a quote?",
        a: "Tell us on your next call or reply to any email from us, and a written offer follows.",
      },
    ],
    ctaLabel: "Ask for a written offer",
    ctaNote: "Custom offers are sent by email as a link you can accept.",
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

/** Which offer we put first for each score band, per the score rubric. */
export const BAND_FIRST_STEP: Record<
  string,
  { headline: string; primary: ServiceSlug; secondary: ServiceSlug }
> = {
  Undiscoverable: {
    headline: "Start with a free call. Nothing else matters until clients can find you.",
    primary: "clarity-call",
    secondary: "bootcamp",
  },
  "Invisible with a pulse": {
    headline: "You have pieces in place. A free call turns them into one working path.",
    primary: "clarity-call",
    secondary: "automation-build",
  },
  Leaky: {
    headline: "People are finding you and slipping away. Plug the leaks first.",
    primary: "automation-build",
    secondary: "strategy-consult",
  },
  Solid: {
    headline: "The basics hold. Now make your story do the selling.",
    primary: "podcast-longform",
    secondary: "automation-build",
  },
  Compounding: {
    headline: "You are compounding. Add reach and let the work keep returning.",
    primary: "podcast-longform",
    secondary: "custom-offer",
  },
};
