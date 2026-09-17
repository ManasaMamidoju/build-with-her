import type { AreaKey } from "@/lib/score-rubric";

export type Article = {
  slug: string;
  area: AreaKey;
  title: string;
  description: string;
  readMinutes: number;
  intro: string;
  sections: { heading: string; body: string[] }[];
  checklist: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "be-found",
    area: "source",
    title: "How clients actually find you",
    description:
      "The three places people look for a business like yours, and what has to be true in each one before they can find you.",
    readMinutes: 6,
    intro:
      "Most women lose the sale before anyone speaks to them, because the search happened somewhere they are not. Being found is not luck. It is a short list of places, filled in properly.",
    sections: [
      {
        heading: "The three places",
        body: [
          "Search, maps and social. Search is someone typing what they need. Maps is someone standing nearby wanting it now. Social is someone asking a friend, or scrolling and recognising you.",
          "You do not need to win all three. You need to be complete in the one where your clients already are, and present in the other two.",
        ],
      },
      {
        heading: "What complete means",
        body: [
          "A page of your own, on a domain with your name on it, that says what you sell and where you sell it. A Google business profile with the right category, real hours, photos taken this year and your services listed with prices or ranges.",
          "One social account that a stranger can read in ten seconds and understand what you do, with a link that goes to your page and not to a dead one.",
        ],
      },
      {
        heading: "The mistake that costs the most",
        body: [
          "Renting your whole presence. If everything lives on one social account, one outage or one suspension takes your business with it. Own the page, then point everything at it.",
        ],
      },
    ],
    checklist: [
      "Buy the domain with your business name on it",
      "Fill your Google profile until it will not let you add anything else",
      "Put one sentence at the top of your page saying what you do, for whom, where",
      "Make every social link go to a page you own",
    ],
  },
  {
    slug: "say-it-plainly",
    area: "clarity",
    title: "Say what you sell in one sentence",
    description:
      "How to turn a slogan into a sentence that tells a stranger what you do, for whom, where, and what it costs.",
    readMinutes: 5,
    intro:
      "Clients decide in a few seconds whether you are for them. A slogan does not help them. A sentence does.",
    sections: [
      {
        heading: "The shape of the sentence",
        body: [
          "What you do, who it is for, where you do it. That is the whole shape. Bridal makeup for brides in Miami. Bookkeeping for salon owners across Florida. Newborn photography in your own home, in Broward County.",
          "It sounds ordinary. Ordinary is what gets found and understood.",
        ],
      },
      {
        heading: "Prices are part of clarity",
        body: [
          "A range is enough. Without one, half the people who would have paid you never ask, because they assume they cannot afford you or fear being sold to.",
          "Write from, or write a band. Then say what changes the price.",
        ],
      },
      {
        heading: "One page, one job",
        body: [
          "Every page should ask for one thing. Book, call, or send a message. Two competing buttons is the same as none.",
        ],
      },
    ],
    checklist: [
      "Write the sentence and put it at the very top of your page",
      "Add a price or a range for your main service",
      "Cut every page down to one clear action",
      "Read it aloud to someone outside your industry",
    ],
  },
  {
    slug: "proof-that-sells",
    area: "attract",
    title: "Get proof that does the selling for you",
    description:
      "Reviews, results and photos, gathered as part of finishing the job rather than chased afterwards.",
    readMinutes: 6,
    intro:
      "Clients trust other clients more than they trust you. Proof is not bragging. It is the evidence that lets a stranger take the risk.",
    sections: [
      {
        heading: "Ask at the peak, not later",
        body: [
          "The best moment is the moment she is happiest, which is usually as she is leaving or when she sees the result. Ask then, in one message, with a link that takes two taps.",
        ],
      },
      {
        heading: "Make the ask part of the job",
        body: [
          "If asking is a decision you make each time, it will not happen. Make it the last step of the work, the same way payment is.",
        ],
      },
      {
        heading: "Show it where the decision happens",
        body: [
          "Reviews sitting on one platform do less work than the same reviews on your booking page, next to the price.",
        ],
      },
    ],
    checklist: [
      "Write the one message you send after every job",
      "Send it the same day, every time",
      "Put your best five reviews next to your prices",
      "Photograph the work while you are still with it",
    ],
  },
  {
    slug: "let-her-book",
    area: "land",
    title: "Let her book and pay without waiting for you",
    description:
      "Why slow replies cost more than advertising, and the smallest setup that stops it happening.",
    readMinutes: 5,
    intro:
      "Most lost work is not lost to a competitor with a better service. It is lost to a competitor who answered first.",
    sections: [
      {
        heading: "The five minute rule",
        body: [
          "Interest cools fast. If a reply takes hours, she has already messaged someone else. You cannot be at your phone all day, so the reply has to be automatic.",
        ],
      },
      {
        heading: "Booking beats messaging",
        body: [
          "Every message you have to answer is a chance to lose the job. A page where she picks a time and pays a deposit removes the whole conversation.",
        ],
      },
      {
        heading: "Deposits and reminders",
        body: [
          "A deposit turns a maybe into a commitment. Reminders the day before and an hour before cut no-shows more than any other single change.",
        ],
      },
    ],
    checklist: [
      "Turn on an instant reply on every channel you use",
      "Publish a booking link and put it everywhere",
      "Take a deposit at booking",
      "Send a reminder the day before and an hour before",
    ],
  },
  {
    slug: "make-it-compound",
    area: "elevate",
    title: "Make the work compound instead of restarting",
    description:
      "Publishing rhythm, a list you own, and follow up that runs itself, so this month builds on last month.",
    readMinutes: 6,
    intro:
      "Busy months and empty months usually mean the business restarts from zero each time. Compounding means what you did in March still brings work in September.",
    sections: [
      {
        heading: "Publish on a rhythm you can keep",
        body: [
          "Once a month, kept for a year, beats daily for three weeks. Pick the rhythm you can keep in your worst week, not your best one.",
        ],
      },
      {
        heading: "Own the list",
        body: [
          "Followers are borrowed. An email list and a phone list are yours. Every enquiry, every past client and every event contact belongs on it, with her permission.",
        ],
      },
      {
        heading: "Follow up is where the money is",
        body: [
          "Most enquiries that go quiet were not a no. They were a not now. Three messages, spread over a few weeks, recover work you already paid to attract.",
        ],
      },
      {
        heading: "Read your numbers monthly",
        body: [
          "Enquiries, bookings, average value, no-shows. Four numbers, once a month, is enough to know what to change.",
        ],
      },
    ],
    checklist: [
      "Choose your publishing rhythm and write the next three in advance",
      "Start the list and add everyone who has ever asked about you",
      "Write three follow up messages and set them to send",
      "Put four numbers on one page and update them monthly",
    ],
  },
];

export function articleBySlug(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}
