export type AreaKey = "source" | "clarity" | "attract" | "land" | "elevate";
export type PetalState = "petal" | "thorn" | "growing";

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
    blurb: "Whether they understand in seconds what you do, for whom, what it costs, and why you.",
    points: 18,
  },
  attract: {
    key: "attract",
    title: "What pulls people in",
    short: "What pulls people in",
    blurb:
      "Whether anything you publish, or anyone who vouches for you, keeps bringing new people.",
    points: 25,
  },
  land: {
    key: "land",
    title: "How they book you",
    short: "How they book",
    blurb: "Whether an interested buyer can book, pay and turn up without waiting on you.",
    points: 17,
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

/**
 * Per-area copy for the result page: one line each for a Petal (70%+), a
 * Thorn (below 50%), everything between is "growing" and gets no line.
 */
export const PETAL_THORN_LINES: Record<AreaKey, { petal: string; thorn: string }> = {
  source: {
    petal: "Clients can find you where they look.",
    thorn: "Clients searching for what you sell do not find you.",
  },
  clarity: {
    petal: "A stranger knows what you do in one read.",
    thorn: "A stranger cannot tell what you do or who it is for.",
  },
  attract: {
    petal: "Your proof does the convincing for you.",
    thorn: "You have the work, but almost nobody sees it.",
  },
  land: {
    petal: "Clients can book and pay without waiting on you.",
    thorn: "People reach out and slip away before they book.",
  },
  elevate: {
    petal: "Clients come back and send people to you.",
    thorn: "Every month starts from zero. Nobody comes back or refers.",
  },
};

export const QUESTIONS: Question[] = [
  // Where you show up, 25 points
  {
    id: "google_business",
    area: "source",
    question: "How complete is your Google Business Profile?",
    helper: "Category, hours, services, photos, and the questions section.",
    points: 4,
    choices: [
      { value: "full", label: "Claimed, complete, and I post updates to it", credit: 1 },
      { value: "claimed", label: "Claimed and filled in, but I never touch it", credit: 0.7 },
      { value: "bare", label: "It exists but it is mostly empty", credit: 0.3 },
      { value: "none", label: "I do not have one, or I cannot get into it", credit: 0 },
      { value: "unsure", label: "I am not sure what that is", credit: 0 },
    ],
    fix: "Claim and complete your Google Business Profile: right category, hours, every service, and ten real photos.",
  },
  {
    id: "own_site",
    area: "source",
    question:
      "Where does a buyer actually land when they look you up, and does it work on a phone?",
    points: 4,
    choices: [
      {
        value: "site_mobile",
        label: "My own website on my own domain, and it works well on a phone",
        credit: 1,
      },
      {
        value: "site",
        label: "My own website on my own domain, but it is clunky on a phone",
        credit: 0.8,
      },
      { value: "onepage", label: "A one page site or landing page I control", credit: 0.6 },
      { value: "linkpage", label: "A link page like Linktree", credit: 0.3 },
      { value: "social", label: "My social profile only", credit: 0.15 },
      { value: "none", label: "Nowhere I would want them to land", credit: 0 },
    ],
    fix: "Put up a real site on your own domain that works well on a phone, so you own the place buyers land.",
  },
  {
    id: "search_name",
    area: "source",
    question: "If someone searches your business name, what comes up?",
    points: 3,
    choices: [
      { value: "own", label: "My site and my profile, top of the page", credit: 1 },
      { value: "somewhere", label: "I am on the first page, further down", credit: 0.6 },
      { value: "others", label: "Other businesses with similar names come up first", credit: 0.25 },
      { value: "nothing", label: "Nothing useful, or I have never checked", credit: 0 },
    ],
    fix: "Search your own business name today, write down every place a buyer lands, and fix the top three.",
  },
  {
    id: "search_service",
    area: "source",
    question: "If someone searches what you sell plus your city, do you appear?",
    points: 5,
    choices: [
      { value: "top", label: "Yes, in the map results or the first few links", credit: 1 },
      { value: "first_page", label: "Somewhere on the first page", credit: 0.7 },
      { value: "deep", label: "Only if I scroll for a while", credit: 0.3 },
      { value: "never", label: "No, never", credit: 0 },
      { value: "unsure", label: "I have not looked", credit: 0 },
    ],
    fix: "Write one page for the exact thing you sell in the exact place you sell it, in their words not yours.",
  },
  {
    id: "listings",
    area: "source",
    question: "Are your name, address, phone and hours the same everywhere they appear?",
    points: 3,
    choices: [
      { value: "same", label: "Identical everywhere, I checked recently", credit: 1 },
      { value: "mostly", label: "Mostly, with some old details floating around", credit: 0.5 },
      { value: "wrong", label: "I know some of them are wrong", credit: 0.15 },
      { value: "unsure", label: "No idea where I am listed", credit: 0 },
    ],
    fix: "Fix your name, phone and hours so every listing matches, starting with the ones that are wrong.",
  },
  {
    id: "ai_answer",
    area: "source",
    question: "If they ask an AI assistant for someone who does what you do, are you named?",
    helper: "ChatGPT, Gemini, Perplexity, or the AI answer at the top of a search.",
    points: 3,
    choices: [
      { value: "yes", label: "Yes, I have seen myself named", credit: 1 },
      { value: "sometimes", label: "Sometimes, in some wordings", credit: 0.6 },
      { value: "no", label: "No, it names other people", credit: 0.15 },
      { value: "untested", label: "I have never tried it", credit: 0 },
    ],
    fix: "Publish plain answer style pages about what you do and where, so AI assistants have something of yours to quote.",
  },
  {
    id: "socials_active",
    area: "source",
    question: "How many places are you actually active on right now?",
    helper: "Active means posting or replying at least a few times a month.",
    points: 3,
    choices: [
      { value: "three", label: "Three or more, and they all point back to me", credit: 1 },
      { value: "two", label: "Two I keep up with", credit: 0.7 },
      { value: "one", label: "One", credit: 0.4 },
      { value: "dormant", label: "I have profiles but they are dormant", credit: 0.1 },
      { value: "none", label: "None", credit: 0 },
    ],
    fix: "Pick the one place your buyer already spends time, get active there weekly, and link it back to your site.",
  },

  // How clear your offer is, 18 points
  {
    id: "one_line",
    area: "clarity",
    question: "Can a stranger tell what you do, who it is for, and why you, in one breath?",
    points: 4,
    choices: [
      { value: "yes", label: "Yes, it names what I do, for whom, and why me", credit: 1 },
      {
        value: "who_missing",
        label: "It names what I do and why me, but not who it is for",
        credit: 0.65,
      },
      {
        value: "why_missing",
        label: "It names what I do and who it is for, but not why me",
        credit: 0.5,
      },
      { value: "vague", label: "It is close but vague", credit: 0.25 },
      { value: "slogan", label: "It is a slogan or a tagline", credit: 0 },
    ],
    fix: "Rewrite your first line as what you do, for whom, and why you, in one breath. No slogans.",
  },
  {
    id: "who_for",
    area: "clarity",
    question: "Do you say plainly who you are for, and who you are not for?",
    points: 3,
    choices: [
      { value: "both", label: "Both, in writing", credit: 1 },
      { value: "for", label: "Who I am for, but not who I am not", credit: 0.6 },
      { value: "implied", label: "It is implied, not written", credit: 0.25 },
      { value: "neither", label: "Neither, I take anyone", credit: 0 },
    ],
    fix: "Add one short section naming exactly who you are for, and who you are not.",
  },
  {
    id: "pricing",
    area: "clarity",
    question: "Can they work out what it costs without asking you?",
    points: 4,
    choices: [
      { value: "prices", label: "Full prices or packages are published", credit: 1 },
      { value: "starting", label: "A starting price or a range", credit: 0.75 },
      { value: "hint", label: "A vague hint like affordable or premium", credit: 0.25 },
      { value: "ask", label: "They have to ask", credit: 0 },
    ],
    fix: "Publish a starting price or a range so they can decide before they contact you.",
  },
  {
    id: "proof",
    area: "clarity",
    question: "What proof is on the page that you have done this before?",
    helper: "Results with numbers, before and after, named testimonials, photos of real work.",
    points: 4,
    choices: [
      { value: "specific", label: "Named clients and specific results", credit: 1 },
      { value: "photos", label: "Real photos or samples of my work", credit: 0.7 },
      { value: "generic", label: "A couple of generic quotes", credit: 0.3 },
      { value: "none", label: "Nothing yet", credit: 0 },
    ],
    fix: "Add three specific proof pieces: a named result, a photo of real work, and a quote with a full name.",
  },
  {
    id: "difference",
    area: "clarity",
    question: "Does anything say why you rather than the next person?",
    points: 3,
    choices: [
      { value: "clear", label: "Yes, one clear reason a buyer would repeat back", credit: 1 },
      { value: "listed", label: "I list qualities like caring and professional", credit: 0.3 },
      { value: "no", label: "Nothing, I look like everyone else", credit: 0 },
    ],
    fix: "Write one sentence on why you, using something only you can say, and put it near the top.",
  },

  // What pulls people in, 25 points
  {
    id: "publishing",
    area: "attract",
    question: "How often does something new go out from you?",
    points: 4,
    choices: [
      { value: "weekly", label: "Weekly or more, on a rhythm I hold", credit: 1 },
      { value: "monthly", label: "Every few weeks", credit: 0.6 },
      { value: "random", label: "When I get to it", credit: 0.25 },
      { value: "none", label: "Not at the moment", credit: 0 },
    ],
    fix: "Pick one rhythm you can hold for twelve weeks and publish on it, even if each piece is short.",
  },
  {
    id: "reviews_count",
    area: "attract",
    question: "How many public reviews do you have?",
    points: 4,
    choices: [
      { value: "lots", label: "More than 50", credit: 1 },
      { value: "many", label: "Between 25 and 50", credit: 0.85 },
      { value: "some", label: "Between 5 and 25", credit: 0.55 },
      { value: "few", label: "Under 5", credit: 0.2 },
      { value: "none", label: "None", credit: 0 },
    ],
    fix: "Ask your last ten happy clients for a review, one personal message each, this week.",
  },
  {
    id: "review_ask",
    area: "attract",
    question: "Is asking for a review part of finishing a job?",
    points: 3,
    choices: [
      { value: "auto", label: "Yes, it sends itself every time", credit: 1 },
      { value: "manual", label: "Yes, but I have to remember to send it", credit: 0.6 },
      { value: "sometimes", label: "Only when it feels right", credit: 0.25 },
      { value: "no", label: "No", credit: 0 },
    ],
    fix: "Make the review request automatic at the end of every job so it stops depending on your memory.",
  },
  {
    id: "referrals",
    area: "attract",
    question: "Do other people send you work on purpose?",
    helper: "Partners, past clients, other businesses serving the same women.",
    points: 4,
    choices: [
      { value: "system", label: "Yes, and there is a set way for them to do it", credit: 1 },
      { value: "regular", label: "Yes, regularly, informally", credit: 0.7 },
      { value: "luck", label: "Occasionally, by luck", credit: 0.35 },
      { value: "no", label: "No", credit: 0 },
    ],
    fix: "Name five businesses that already serve your buyer and set up one clear way for them to send them to you.",
  },
  {
    id: "video",
    area: "attract",
    question: "Is there video or audio of you talking about your work?",
    points: 3,
    choices: [
      { value: "library", label: "Yes, a body of it that keeps getting found", credit: 1 },
      { value: "some", label: "A few pieces, easy to find", credit: 0.7 },
      { value: "buried", label: "A little, buried in my feed", credit: 0.35 },
      { value: "none", label: "None, and the idea makes me nervous", credit: 0 },
    ],
    fix: "Record one honest ten minute conversation about your work and put it where a buyer will find it.",
  },
  {
    id: "faqs",
    area: "attract",
    question: "Does your site answer the questions clients ask before they book?",
    points: 3,
    choices: [
      { value: "yes", label: "Yes, there is a page or section that answers them", credit: 1 },
      { value: "scattered", label: "A few answers are scattered around", credit: 0.33 },
      { value: "no", label: "No, they ask me in DMs or on the phone", credit: 0 },
    ],
    fix: "Write down the five questions clients ask every week and put the answers on your page.",
  },
  {
    id: "local",
    area: "attract",
    question: "How do people in your area meet you outside of social media?",
    points: 2,
    choices: [
      {
        value: "regular",
        label: "Events, partners, or other local businesses send people my way regularly",
        credit: 1,
      },
      { value: "occasional", label: "I do the occasional event or collab", credit: 0.65 },
      { value: "thought_about", label: "I have thought about it and not done it", credit: 0.3 },
      {
        value: "none",
        label: "I do not. Clients come from online or word of mouth only",
        credit: 0,
      },
    ],
    fix: "Pick one local partner or event and show up once this month.",
  },
  {
    id: "content_mix",
    area: "attract",
    question: "What do you post most?",
    points: 2,
    choices: [
      {
        value: "mix",
        label: "A mix: tips, client results, my story, and what is trending",
        credit: 1,
      },
      { value: "work", label: "Mostly my work and client results", credit: 0.65 },
      { value: "promo", label: "Mostly promotions and availability", credit: 0.3 },
      { value: "whatever", label: "Whatever comes to mind, when I remember", credit: 0 },
    ],
    fix: "Add client results and your own story into the mix, not just promotions.",
  },

  // How they book you, 17 points
  {
    id: "booking",
    area: "land",
    question: "Can they book or buy without a back and forth message?",
    points: 4,
    choices: [
      { value: "self", label: "Yes, they pick a time and book themselves", credit: 1 },
      { value: "form", label: "They fill a form and I confirm", credit: 0.5 },
      { value: "message", label: "They have to message me first", credit: 0.25 },
      { value: "manual", label: "It is all phone calls and messages", credit: 0 },
    ],
    fix: "Put real booking on your site so they can pick a time without waiting on your reply.",
  },
  {
    id: "response",
    area: "land",
    question: "How fast does a new enquiry get an answer?",
    points: 3,
    choices: [
      { value: "instant", label: "Within minutes, automatically", credit: 1 },
      { value: "hours", label: "Within a few hours", credit: 0.65 },
      { value: "day", label: "Within a day or two", credit: 0.3 },
      { value: "slow", label: "Longer, and some get missed", credit: 0 },
    ],
    fix: "Set up an instant reply that answers the first three questions and offers a time to talk.",
  },
  {
    id: "payment",
    area: "land",
    question: "How do they pay you?",
    points: 3,
    choices: [
      { value: "online", label: "Card or payment link, online, up front", credit: 1 },
      { value: "deposit", label: "Deposit online, the rest in person", credit: 0.75 },
      { value: "transfer", label: "Bank transfer only", credit: 0.35 },
      { value: "cash", label: "Cash, or I chase invoices", credit: 0 },
    ],
    fix: "Turn on online payment so paying you takes one tap instead of a bank app.",
  },
  {
    id: "noshow",
    area: "land",
    question: "What happens between booking and turning up?",
    points: 3,
    choices: [
      { value: "reminders", label: "Automatic confirmation and reminders", credit: 1 },
      { value: "manual", label: "I message them myself if I remember", credit: 0.5 },
      { value: "nothing", label: "Nothing, and people forget", credit: 0 },
    ],
    fix: "Turn on automatic confirmations and a reminder the day before so fewer people forget you.",
  },
  {
    id: "objections",
    area: "land",
    question: "Are the questions they always ask answered before they ask?",
    points: 2,
    choices: [
      { value: "yes", label: "Yes, in a questions section on the page", credit: 1 },
      { value: "some", label: "Some of them", credit: 0.5 },
      { value: "no", label: "No, I answer each one by hand", credit: 0 },
    ],
    fix: "Write down the five questions you answer every week and put the answers on your page.",
  },
  {
    id: "leads_live",
    area: "land",
    question: "Where do your leads live?",
    points: 2,
    choices: [
      { value: "crm", label: "A CRM or booking tool that tracks every inquiry", credit: 1 },
      { value: "spreadsheet", label: "A spreadsheet or notes I update by hand", credit: 0.5 },
      { value: "inbox", label: "My DMs, my inbox, or my head", credit: 0 },
    ],
    fix: "Move every inquiry into one place you actually check, even if it starts as a simple spreadsheet.",
  },

  // What keeps you growing, 15 points
  {
    id: "followup",
    area: "elevate",
    question: "Does anyone who did not buy hear from you again?",
    points: 3,
    choices: [
      { value: "auto", label: "Yes, a sequence sends itself", credit: 1 },
      { value: "manual", label: "Only if I remember", credit: 0.4 },
      { value: "no", label: "No, they go quiet and that is that", credit: 0 },
    ],
    fix: "Write a three message follow up for the people who went quiet and let it send itself.",
  },
  {
    id: "list",
    area: "elevate",
    question: "Do you have a list of your people you can actually reach?",
    points: 3,
    choices: [
      { value: "using", label: "Yes, and I email it on a rhythm", credit: 1 },
      { value: "have", label: "I have one but rarely send", credit: 0.45 },
      { value: "scattered", label: "Names scattered across my phone and inbox", credit: 0.2 },
      { value: "none", label: "No list", credit: 0 },
    ],
    fix: "Start collecting emails on your site this week, with one simple reason for them to sign up.",
  },
  {
    id: "repeat",
    area: "elevate",
    question: "Is there a reason for a past client to come back?",
    points: 3,
    choices: [
      { value: "clear", label: "Yes, a clear next thing to buy", credit: 1 },
      { value: "ad_hoc", label: "They come back when they think of it", credit: 0.4 },
      { value: "no", label: "No, every sale is a one off", credit: 0 },
    ],
    fix: "Create one clear next thing for a past client to buy, and tell your list about it.",
  },
  {
    id: "aftercare",
    area: "elevate",
    question: "After a client's appointment or project, do they hear from you?",
    points: 3,
    choices: [
      {
        value: "auto",
        label: "Yes, automatically: aftercare, a check-in, and a prompt to rebook",
        credit: 1,
      },
      { value: "manual", label: "I send something myself when I remember", credit: 0.33 },
      { value: "no", label: "No, unless they reach out", credit: 0 },
    ],
    fix: "Set up one automatic message after every job: a check-in, and a prompt to rebook.",
  },
  {
    id: "referral_reason",
    area: "elevate",
    question: "Do clients have a reason to send you people?",
    points: 3,
    choices: [
      { value: "reminded", label: "Yes, a referral perk, and I remind them about it", credit: 1 },
      { value: "unmentioned", label: "I have a perk but rarely mention it", credit: 0.33 },
      { value: "no", label: "No, I rely on them thinking of me", credit: 0 },
    ],
    fix: "Set up one referral perk and mention it every time a client thanks you.",
  },
];

/**
 * "One more thing": five owner-dependency questions, scored separately from
 * the 100-point total. help/time/numbers moved here from Elevate; week_off
 * and unused_tools are new. 10 or more of 15 sets the "with thorns" flag.
 */
export const THORN_QUESTIONS: Question[] = [
  {
    id: "help",
    area: "elevate",
    question: "Who else touches the marketing side of the business?",
    points: 3,
    choices: [
      { value: "team", label: "I have help I trust", credit: 0 },
      { value: "occasional", label: "I hire help now and then", credit: 0.33 },
      { value: "alone", label: "All me, in the gaps", credit: 0.67 },
      { value: "nobody", label: "Nobody, it mostly does not happen", credit: 1 },
    ],
    fix: "Hand off the one marketing job you keep postponing, even if it is only a few hours a month.",
  },
  {
    id: "time",
    area: "elevate",
    question: "How many hours a week does this need directly from you?",
    points: 3,
    choices: [
      { value: "none", label: "None, it runs without my hours in it", credit: 0 },
      { value: "one", label: "About an hour", credit: 0.33 },
      { value: "two", label: "Two to four", credit: 0.67 },
      { value: "five", label: "Five or more, it does not move without me", credit: 1 },
    ],
    fix: "Find the one task eating your hours and hand it to a tool or a person.",
  },
  {
    id: "numbers",
    area: "elevate",
    question: "Do you know where last month's clients came from?",
    points: 3,
    choices: [
      { value: "tracked", label: "Yes, I track every one", credit: 0 },
      { value: "roughly", label: "Roughly, from memory", credit: 0.33 },
      { value: "no", label: "No idea", credit: 1 },
    ],
    fix: "Ask every new client how they found you and write it down, so next month you know what works.",
  },
  {
    id: "week_off",
    area: "elevate",
    question: "If you took a week off with no phone, what happens?",
    points: 3,
    choices: [
      { value: "runs", label: "Everything runs: bookings, confirmations, follow ups", credit: 0 },
      { value: "some", label: "Some of it runs, some waits for me", credit: 0.33 },
      { value: "mostly_waits", label: "It mostly waits for me", credit: 0.67 },
      { value: "stops", label: "It stops", credit: 1 },
    ],
    fix: "Pick one thing that stopped and set it up to run without you before you next try this.",
  },
  {
    id: "unused_tools",
    area: "elevate",
    question: "Have you set up a tool or system that you or your team stopped using?",
    points: 3,
    choices: [
      { value: "none", label: "No. What I set up, we use", credit: 0 },
      { value: "one_two", label: "One or two", credit: 0.67 },
      { value: "many", label: "More than I want to admit", credit: 1 },
    ],
    fix: "Pick the tool everyone quietly stopped using and either fix why, or cancel it.",
  },
];

export const WITH_THORNS_THRESHOLD = 10;
export const THORN_MAX = 15;

export const BANDS = [
  {
    min: 0,
    max: 39,
    name: "Undiscoverable",
    line: "Clients looking for exactly what you sell will not find you yet.",
  },
  {
    min: 40,
    max: 54,
    name: "Invisible with a pulse",
    line: "You exist online, but almost nothing is working to bring you clients.",
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

/** What she actually answers: the 5 areas plus the thorn section. */
export const TOTAL_QUESTION_COUNT = QUESTIONS.length + THORN_QUESTIONS.length;

export function petalStateFor(earned: number, outOf: number): PetalState {
  if (outOf <= 0) return "growing";
  const pct = earned / outOf;
  if (pct >= 0.7) return "petal";
  if (pct < 0.5) return "thorn";
  return "growing";
}
