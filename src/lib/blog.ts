export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  intro: string;
  sections: { heading: string; body: string[] }[];
  takeaways: string[];
  cta: { label: string; to: "/score/quiz" | "/services" | "/podcast" };
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "findability-score-not-more-content",
    title: 'Why I built a score instead of telling you to "post more content"',
    description:
      "Posting more is not a findability strategy. Here is what the Findability Score actually checks, and why volume was never the problem.",
    publishedAt: "2026-08-04",
    readMinutes: 6,
    tags: ["Findability Score", "marketing advice"],
    intro:
      "Almost every free piece of marketing advice online reduces to the same sentence: post more. More reels, more carousels, more emails, more everything. I do not think that is wrong exactly. I think it answers a question nobody who is losing customers actually asked.",
    sections: [
      {
        heading: '"Post more" assumes the problem is volume',
        body: [
          "It is advice built for someone who already has a page worth landing on, a Google profile that says what they do, and a way to take a booking without a back-and-forth conversation. For a woman missing one of those, more content just means more people finding a dead end faster.",
          "I have sat across from women posting daily who could not tell me, in one sentence, what they charge. The content was not the gap. The page it was supposed to send people to was.",
        ],
      },
      {
        heading: "What the score checks instead",
        body: [
          "Five things, none of them about how often you post: whether buyers can find you at all, whether what you sell is stated plainly, whether there is proof strangers can trust, whether she can book and pay without waiting on you, and whether any of this compounds instead of resetting every month.",
          "Content sits inside one of those five, not above all of them. A brilliant reel that links to a bio that links to nothing is reach without a landing.",
        ],
      },
      {
        heading: "Why this take is not popular",
        body: [
          "Telling someone to post more is easy to say and easy to sell as a course. Telling her the real fix is a domain, a clear sentence, and a booking page is less exciting and does not need twelve weeks of content to teach.",
          "I would rather tell you the truth in thirty minutes on a free call than sell you a content calendar for a leak I could point at directly.",
        ],
      },
    ],
    takeaways: [
      "Check whether a stranger can find you before you check how often you post",
      "Write the one sentence that says what you sell, for whom, and where",
      "Fix the page the content sends people to before you make more content",
    ],
    cta: { label: "Take the Findability Score", to: "/score/quiz" },
  },
  {
    slug: "you-should-own-your-website",
    title: "If an agency will not hand you the keys, that is not a website. It is a lease.",
    description:
      "Why ownership goes in writing before I build anything, and why most agencies you have talked to never will put it there.",
    publishedAt: "2026-08-18",
    readMinutes: 5,
    tags: ["ownership", "web agencies"],
    intro:
      "I have met women paying a monthly fee for a website they cannot touch, hosted on an account they cannot log into, holding customer data they cannot export. Nobody explained that to them upfront, because explaining it upfront would have cost the sale.",
    sections: [
      {
        heading: "The business model that depends on you not owning anything",
        body: [
          "If the domain sits in the agency's account, the accounts are theirs, and the data lives in a system only they can query, then leaving them is not a decision you can make in an afternoon. That is not an accident. A client who cannot leave without months of disruption is a client who tolerates a lot before she finally does.",
          "This is not every agency, and I am not saying it is malicious in every case. I am saying it is common enough that you should ask about it before you sign anything, and that most sales calls are built to avoid the question ever coming up.",
        ],
      },
      {
        heading: "What ownership actually means, specifically",
        body: [
          "The domain is registered in your name, on your card, from day one. The hosting, the booking system, the email sending, all under accounts you hold the login for. The data, exportable, in a format you could hand to anyone else tomorrow.",
          "If any one of those lives with the agency instead of with you, you do not own your website. You are renting a very convincing version of one.",
        ],
      },
      {
        heading: "Why I build it this way even though it costs me leverage",
        body: [
          "It means a client can fire me. It means I have to earn the next month, not assume it because leaving is expensive for her. I would rather build something worth keeping than something that is merely hard to leave.",
        ],
      },
    ],
    takeaways: [
      "Ask, before you sign, whose name the domain is registered in",
      "Ask for admin access to every account your business depends on, not viewer access",
      "Ask what happens to your customer data on the day you leave",
    ],
    cta: { label: "See how we build", to: "/services" },
  },
  {
    slug: "aeo-is-not-seo-with-a-new-name",
    title:
      "AEO is not SEO with a new name, and treating it like one is already costing you customers",
    description:
      "AI answer engines read a small business differently than Google search does. Most SEO advice has not caught up, and neither have most small business owners.",
    publishedAt: "2026-08-27",
    readMinutes: 6,
    tags: ["AEO", "SEO", "AI search"],
    intro:
      'A growing share of people asking "who does X near me" are not typing it into Google. They are asking ChatGPT, or Perplexity, or whatever is built into their phone, and getting a short answer with two or three names in it. If your business is not one of the names, it does not matter how well you rank on page one of search, because she never opened search.',
    sections: [
      {
        heading: "Ranking and being recommended are not the same skill",
        body: [
          "Search engine optimisation is built around ranking a page for a query. Answer engine optimisation is built around being the confident, correctly-attributed answer an AI model gives when someone asks a question in plain language. The inputs overlap, but they are not the same target.",
          "An AI model pulling together an answer weighs consistency of information about you across the web, clear structured facts (what you do, where, for whom, at what price), and being mentioned by other sources it already trusts. Keyword density and backlinks matter less here than being unambiguous everywhere you already appear.",
        ],
      },
      {
        heading: "Where this actually breaks for small businesses",
        body: [
          "Your business name spelled three different ways across your website, your Google profile and your social bios. Prices missing everywhere, so a model summarising you has nothing concrete to repeat. A Google Business Profile that has not been touched since you opened, while your actual hours and services live only in a caption from eight months ago.",
          "None of that is a search-engine problem in the old sense. It is a consistency and clarity problem, and it is exactly what an answer engine trips over first.",
        ],
      },
      {
        heading: "What I actually check for this",
        body: [
          "The same name, the same category, the same one-sentence description of what you do, everywhere a model might read about you. Prices or ranges stated somewhere public. Recent, structured information rather than a paragraph written once and never revisited.",
          'It is less glamorous than "AEO strategy" as a phrase suggests. It is mostly cleanup, done properly, once.',
        ],
      },
    ],
    takeaways: [
      "Say what you do, for whom, and where in the same words on your site, your Google profile, and your bios",
      "Put a price or a range somewhere public, even a range",
      "Update your Google Business Profile like it is read more often than your homepage, because it is",
    ],
    cta: { label: "Take the Findability Score", to: "/score/quiz" },
  },
  {
    slug: "boss-babe-marketing-is-hurting-you",
    title: '"Boss babe" marketing is not helping you get taken seriously',
    description:
      "The language a lot of women's business content uses to sell to you is the same language keeping serious buyers from taking you seriously.",
    publishedAt: "2026-09-02",
    readMinutes: 5,
    tags: ["brand voice", "opinion"],
    intro:
      'I do not use "boss babe," "crushing it," "hustle harder," or "game-changer" anywhere in my own marketing, on purpose. Not because the women using that language are not real or not working hard. Because I have watched it cost them credibility with the exact buyers who could afford to hire them.',
    sections: [
      {
        heading: "Hype is a tell, and buyers with money have learned it",
        body: [
          'A woman who has been burned before by a service she overpaid for reads "crushing it" and "level up your business" as a warning sign, the same way she reads three exclamation marks in a row. It signals a sale is coming, before any value has been shown.',
          "The businesses that actually book the higher-paying, lower-drama clients tend to sound calmer, not louder. Plain descriptions of what they do, a price, and evidence, instead of energy standing in for substance.",
        ],
      },
      {
        heading: "It is not about being less confident",
        body: [
          'Confident and loud are different things. "I built this because I needed it myself and could not find it" is confident. "Watch me crush my goals this quarter" is performance. One earns trust from a stranger deciding whether to spend money with you. The other mostly earns engagement from people who already like you.',
        ],
      },
      {
        heading: "What I do instead",
        body: [
          "I say what the thing costs, what it includes, and what happens if it does not work for you. I show the actual result instead of describing how it felt to get it. It is a slower way to sound impressive and a faster way to be believed.",
        ],
      },
    ],
    takeaways: [
      "Read your own bio as a stranger deciding whether to trust you with money",
      "Replace one hype phrase with one plain fact this week",
      "Let the result speak instead of the energy around the result",
    ],
    cta: { label: "See how we describe our own work", to: "/services" },
  },
  {
    slug: "free-call-should-not-be-a-trap",
    title: "A free call should never be a trap. Here is how to tell before you book one.",
    description:
      'Most "free consultations" are structured to make you feel guilty for saying no by the end of it. An honest one looks different from the first minute.',
    publishedAt: "2026-09-10",
    readMinutes: 5,
    tags: ["sales", "opinion"],
    intro:
      "A free call is not automatically generous. A lot of them are built the same way: build rapport, dig into your pain until it feels urgent, then present a package priced to be signed on the spot before you have time to think. I have been on the other end of those calls, which is exactly why my own free call is not run that way.",
    sections: [
      {
        heading: "How to spot the pattern before you book",
        body: [
          'Look at how the call is described. "Strategy session" that requires you to fill out a long questionnaire about your revenue and goals before you are allowed to book is usually qualifying you for a pitch, not preparing to help you for free. A vague time limit, an urgency discount only available "today," and a script that keeps circling back to your problem without naming a single specific fix, are all signs the call exists to sell, not to answer.',
          "An honest free call names something useful inside the call itself, whether or not you ever pay for anything. If the only value happens after payment, it was never really free.",
        ],
      },
      {
        heading: "What an honest one looks like instead",
        body: [
          "On our Clarity Call, we read your Findability Score together and name the one thing costing you the most money right now, whether or not that fix is something we sell. If a free tool solves it, I say so. That costs me a sale sometimes. It also means the women who do become clients trust that the recommendation was not just a script.",
        ],
      },
      {
        heading: "The question that exposes the difference",
        body: [
          'Ask, before you book: "If I decide not to buy anything, will I still walk away with something specific I can use?" A real free call has an answer ready. A disguised pitch will pivot back to booking the call as the answer.',
        ],
      },
    ],
    takeaways: [
      "Notice whether the call's marketing names a specific outcome or only a feeling",
      "Ask what you walk away with if you say no at the end",
      "Treat urgency discounts on a first call as a signal, not a bonus",
    ],
    cta: { label: "Book a Clarity Call, free either way", to: "/services" },
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
