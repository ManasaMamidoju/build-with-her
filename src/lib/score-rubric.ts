export type AreaKey = "source" | "clarity" | "attract" | "land" | "elevate";

export type Choice = {
  value: string;
  label: string;
  /** 0 to 1 share of the question's points */
  credit: number;
};

export type Question = {
  id: string;
  area: AreaKey;
  question: string;
  helper?: string;
  points: number;
  choices: Choice[];
  /** Written as one concrete action, shown when she scores low here */
  fix: string;
};

export const AREAS: Record<
  AreaKey,
  { key: AreaKey; title: string; short: string; blurb: string; points: number }
> = {
  source: {
    key: "source",
    title: "Where you show up",
    short: "Where you show up",
    blurb: "Whether a buyer looking for what you sell can actually land on you.",
    points: 25,
  },
  clarity: {
    key: "clarity",
    title: "How clear your offer is",
    short: "Clarity",
    blurb: "Whether she understands in seconds what you do, for whom, and what it costs.",
    points: 20,
  },
  attract: {
    key: "attract",
    title: "What pulls people in",
    short: "What pulls people in",
    blurb: "Whether anything you publish or anyone who vouches for you brings new people.",
    points: 25,
  },
  land: {
    key: "land",
    title: "How they book you",
    short: "How they book",
    blurb: "Whether an interested buyer can pay or book without waiting on you.",
    points: 15,
  },
  elevate: {
    key: "elevate",
    title: "What keeps you growing",
    short: "What keeps you growing",
    blurb: "Whether the work you already did keeps returning to you.",
    points: 15,
  },
};

export const AREA_ORDER: AreaKey[] = ["source", "clarity", "attract", "land", "elevate"];

const yesNo = (yes: string, partly: string, no: string): Choice[] => [
  { value: "yes", label: yes, credit: 1 },
  { value: "partly", label: partly, credit: 0.5 },
  { value: "no", label: no, credit: 0 },
];

export const QUESTIONS: Question[] = [
  // Source, 25 points
  {
    id: "google_business",
    area: "source",
    question: "Do you have a Google Business Profile you have actually filled in?",
    helper: "Hours, photos, services, the right category.",
    points: 6,
    choices: yesNo("Yes, filled in and current", "It exists but it is bare", "No, or I am not sure"),
    fix: "Claim and complete your Google Business Profile: category, hours, services, and ten real photos.",
  },
  {
    id: "own_site",
    area: "source",
    question: "Do you own a website, not just a social page?",
    points: 5,
    choices: yesNo(
      "Yes, my own site on my own domain",
      "A link page or a marketplace listing only",
      "No, social only",
    ),
    fix: "Put up a real site on your own domain so you own the place people land.",
  },
  {
    id: "search_name",
    area: "source",
    question: "If someone searches your business name, do you come up first?",
    points: 4,
    choices: yesNo("Yes, first result", "Somewhere on the first page", "No, or I have never checked"),
    fix: "Search your own business name today and write down every place a buyer lands, then fix the top three.",
  },
  {
    id: "search_service",
    area: "source",
    question: "If someone searches what you sell plus your city, do you appear at all?",
    points: 6,
    choices: yesNo("Yes, on the first page", "Sometimes, deep in the results", "No, never"),
    fix: "Write one page for the exact thing you sell in the exact place you sell it, in her words not yours.",
  },
  {
    id: "listings",
    area: "source",
    question: "Are your name, address, phone and hours the same everywhere they appear?",
    points: 4,
    choices: yesNo("Yes, identical everywhere", "Mostly, with some old details", "No idea"),
    fix: "Fix your name, phone and hours so every listing matches, starting with the ones that are wrong.",
  },

  // Clarity, 20 points
  {
    id: "one_line",
    area: "clarity",
    question: "Can a stranger tell what you do from the first line on your page?",
    points: 6,
    choices: yesNo(
      "Yes, it names what I do and for whom",
      "It is close but vague",
      "No, it is a slogan",
    ),
    fix: "Rewrite your first line as what you do, for whom, and where. No slogans.",
  },
  {
    id: "who_for",
    area: "clarity",
    question: "Do you say plainly who you are for, and who you are not for?",
    points: 4,
    choices: yesNo("Yes, both", "I say who I am for", "Neither"),
    fix: "Add one short section naming exactly who you are for, and who you are not.",
  },
  {
    id: "pricing",
    area: "clarity",
    question: "Can she see prices, or at least a starting price, without asking you?",
    points: 5,
    choices: yesNo(
      "Yes, prices or starting prices are visible",
      "A range or a hint",
      "No, she has to ask",
    ),
    fix: "Publish a starting price or a range so she can decide before she contacts you.",
  },
  {
    id: "proof",
    area: "clarity",
    question: "Is there proof on the page that you have done this before?",
    helper: "Results, before and after, named testimonials, real photos of your work.",
    points: 5,
    choices: yesNo("Yes, specific proof", "A couple of generic quotes", "None"),
    fix: "Add three specific proof pieces: a named result, a photo of real work, and a quote with a full name.",
  },

  // Attract, 25 points
  {
    id: "publishing",
    area: "attract",
    question: "Do you publish something on a regular rhythm?",
    points: 5,
    choices: yesNo("Yes, weekly or better", "When I get to it", "Not at the moment"),
    fix: "Pick one rhythm you can hold for twelve weeks and publish on it, even if it is short.",
  },
  {
    id: "reviews_count",
    area: "attract",
    question: "How many public reviews do you have?",
    points: 6,
    choices: [
      { value: "many", label: "More than 25", credit: 1 },
      { value: "some", label: "Between 5 and 25", credit: 0.6 },
      { value: "few", label: "Under 5", credit: 0.2 },
      { value: "none", label: "None", credit: 0 },
    ],
    fix: "Ask your last ten happy clients for a review, one message each, this week.",
  },
  {
    id: "review_ask",
    area: "attract",
    question: "Is asking for a review part of finishing a job?",
    points: 4,
    choices: yesNo("Yes, every time, automatically", "Sometimes, when I remember", "No"),
    fix: "Make the review request automatic at the end of every job so it stops depending on your memory.",
  },
  {
    id: "referrals",
    area: "attract",
    question: "Do other people send you work on purpose?",
    helper: "Partners, past clients, other businesses that serve the same women.",
    points: 5,
    choices: yesNo("Yes, regularly", "Occasionally, by luck", "No"),
    fix: "Name five businesses that already serve your buyer and set up one clear way for them to send her to you.",
  },
  {
    id: "video",
    area: "attract",
    question: "Is there any video or audio of you talking about your work?",
    points: 5,
    choices: yesNo("Yes, and it is easy to find", "A little, buried", "None"),
    fix: "Record one honest ten minute conversation about your work and put it where a buyer will find it.",
  },

  // Land, 15 points
  {
    id: "booking",
    area: "land",
    question: "Can she book or buy without a back and forth message?",
    points: 6,
    choices: yesNo("Yes, she books herself", "She has to message me first", "No, it is all manual"),
    fix: "Put real booking on your site so she can pick a time without waiting on your reply.",
  },
  {
    id: "response",
    area: "land",
    question: "How fast does a new enquiry get an answer?",
    points: 5,
    choices: [
      { value: "instant", label: "Within minutes, automatically", credit: 1 },
      { value: "hours", label: "Within a few hours", credit: 0.6 },
      { value: "day", label: "Within a day or two", credit: 0.25 },
      { value: "slow", label: "Longer, or some get missed", credit: 0 },
    ],
    fix: "Set up an instant reply that answers the first three questions and offers a time to talk.",
  },
  {
    id: "payment",
    area: "land",
    question: "Can she pay you online?",
    points: 4,
    choices: yesNo("Yes, card or link", "Bank transfer only", "No, cash or invoice chasing"),
    fix: "Turn on online payment so paying you takes one tap instead of a bank app.",
  },

  // Elevate, 15 points
  {
    id: "followup",
    area: "elevate",
    question: "Does anyone who did not buy hear from you again?",
    points: 5,
    choices: yesNo("Yes, automatically", "Only if I remember", "No"),
    fix: "Write a three message follow up for the people who went quiet and let it send itself.",
  },
  {
    id: "list",
    area: "elevate",
    question: "Do you have a list of your people you can actually reach?",
    points: 4,
    choices: yesNo("Yes, and I use it", "I have one but never send", "No list"),
    fix: "Start collecting emails on your site this week, even with one simple offer to sign up for.",
  },
  {
    id: "repeat",
    area: "elevate",
    question: "Is there a reason for a past client to come back?",
    points: 3,
    choices: yesNo("Yes, a clear next thing to buy", "Nothing formal", "No"),
    fix: "Create one clear next thing for a past client to buy, and tell your list about it.",
  },
  {
    id: "numbers",
    area: "elevate",
    question: "Do you know where last month's clients came from?",
    points: 3,
    choices: yesNo("Yes, I track it", "Roughly, from memory", "No"),
    fix: "Ask every new client how she found you and write it down, so next month you know what works.",
  },
];

export const BANDS = [
  {
    min: 0,
    max: 39,
    name: "Undiscoverable",
    line: "A buyer looking for exactly what you sell will not find you yet.",
  },
  {
    min: 40,
    max: 54,
    name: "Invisible with a pulse",
    line: "You exist online, but almost nothing is working to bring you buyers.",
  },
  {
    min: 55,
    max: 69,
    name: "Leaky",
    line: "People do find you. Most of them fall out before they book.",
  },
  {
    min: 70,
    max: 84,
    name: "Solid",
    line: "The basics hold. What is missing is the part that compounds.",
  },
  {
    min: 85,
    max: 100,
    name: "Compounding",
    line: "Your work keeps returning to you. Now it is about scale and story.",
  },
] as const;

export function bandFor(total: number) {
  return BANDS.find((band) => total >= band.min && total <= band.max) ?? BANDS[0];
}

export const AREA_POINTS: Record<AreaKey, number> = AREA_ORDER.reduce(
  (acc, key) => {
    acc[key] = QUESTIONS.filter((q) => q.area === key).reduce((sum, q) => sum + q.points, 0);
    return acc;
  },
  {} as Record<AreaKey, number>,
);
