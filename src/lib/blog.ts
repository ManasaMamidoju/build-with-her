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
  /** Present on a guest interview post: who we talked to and where to follow their work. */
  interview?: {
    guestName: string;
    businessName: string;
    instagramUrl: string;
    businessWebsite?: string;
    backlinkLabel?: string;
  };
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

  // Guest interviews from the Ladies Let's Talk Tech / street-style series.
  {
    slug: "jessenia-garcia-datably-interview",
    title: "Jessenia Garcia on Measuring What Actually Predicts Ad Performance",
    description:
      "Datably founder Jessenia Garcia on measuring what actually predicts ad performance, and why she was the first-ever guest in our interview series.",
    publishedAt: "2026-07-20",
    readMinutes: 4,
    tags: ["Interview", "AI & marketing", "founder stories"],
    intro:
      'Every founder eventually has a "first ever" moment. For Jessenia Garcia, hers came in front of a camera on a Miami street, as the very first guest in what became our Ladies Let\'s Talk Tech interview series. "My first ever interview!!!! Let\'s goo!!!" is how we captioned it at the time, and looking back, it set the tone for everything the series became: real conversations with women entrepreneurs about how they actually use AI, not the polished version you get on a keynote stage.',
    sections: [
      {
        heading: "What Jessenia Is Building",
        body: [
          "Jessenia is the founder of Datably, a company that uses computer vision and AI to measure ad effectiveness and predict advertising outcomes. Her focus is on a problem most marketers still solve by instinct: which version of a creative actually performs better, beyond the surface-level numbers everyone already tracks.",
          '"The way that I use it at the company, at Datably, it\'s understanding ad effectiveness and understanding and predicting outcomes for advertising, being able to understand which version performs better," she told us. "Not a lot of people use that as a seen tool, or even in the industry, it\'s an under method to understand metrics. A lot of people on social media are not using the metrics that Datably can give them that go beyond the traditional metrics like likes and views and shares."',
          "That distinction, between the metrics everyone watches and the ones that actually predict performance, is the core of what she's built her business around.",
        ],
      },
      {
        heading: "Her AI Philosophy",
        body: [
          'Asked for one word that captures AI, Jessenia didn\'t hesitate: "Efficiency." And asked what she\'d automate for the rest of her life if she could pick one thing, her answer was refreshingly personal rather than business-focused. "It\'s great to be my assistant. AI is able to help me with making decisions, it has a lot of understanding that it just tells me kind of like what to do. It might give me the right input."',
        ],
      },
      {
        heading: "On Women in the Industry",
        body: [
          "We closed our first-ever interview by asking Jessenia whether she thought AI was as inclusive as it's supposed to be. Her answer was thoughtful rather than simple. \"I feel like it's inclusive, it's just like not a lot of females in the industry,\" she said. \"I think sometimes it could be a little scary for females to come into like a man-dominated industry. I don't feel like it's exclusive or inclusive. There's just a portion of males and females in the industry that it just needs to seem that way. And we females need to start working on pushing AI and creating companies, building companies of AI and ourselves seen in that industry.\"",
          "That's not a complaint, it's a call to action, and it's one she's already answering by building Datably herself.",
        ],
      },
      {
        heading: "Why Jessenia Started This Series",
        body: [
          "We'll always have a soft spot for this interview. Jessenia agreed to be the test case for an entirely new interview format, a street-style conversation between female entrepreneurs and networking spaces, before we had any track record to point to. Every interview in this series since has followed the path she helped us pave.",
        ],
      },
      {
        heading: "Where to Find Jessenia",
        body: [
          "You can follow Jessenia Garcia's work building Datably on Instagram and LinkedIn.",
          "Are you a female founder building in AI who wants to be seen in the industry the way Jessenia describes? Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Track the metrics that actually predict performance, not just likes and views",
      "If you're a woman building in AI, treat visibility as part of the job",
      "Efficiency is a fine one-word AI philosophy once you build the judgment around it",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Jessenia Garcia",
      businessName: "Founder, Datably",
      instagramUrl: "https://www.instagram.com/p/DMW0TEkMhMm/",
      backlinkLabel: "Follow Jessenia Garcia",
    },
  },
  {
    slug: "rachel-ai-hot-take-interview",
    title: "Rachel's Hot Take: AI Is Making Us Worse at Thinking",
    description:
      "An event coordinator and yoga teacher's hot take: AI is making us worse at thinking, and what she does about it instead of quitting it.",
    publishedAt: "2026-08-01",
    readMinutes: 4,
    tags: ["Interview", "wellness", "AI skepticism"],
    intro:
      "Most people we interview about AI come in with an opinion they're excited to share. Rachel came in with a warning. We met Rachel at a Manatech Miami N8N workshop, an event built around automation and AI tools, which made her answer to our first question land even harder than usual.",
    sections: [
      {
        heading: "Her Hot Take",
        body: [
          "\"My hot take, my very hot take on AI is that it's making people dumber,\" Rachel told us, without hesitation. Rachel works as an event coordinator and also teaches yoga and Pilates, which gives her a dual perspective most AI conversations don't include: someone who plans logistics for a living and someone who works in movement and mind-body practice.",
          "Her concern isn't abstract. \"I think it's making people think less. It's making things very easy. I think we're losing our critical thinking skills and also our communication, our face-to-face communication skills.\"",
        ],
      },
      {
        heading: "Her Suggestion, Not a Rejection",
        body: [
          "What made Rachel's take useful rather than just contrarian is that she didn't tell us to abandon AI. \"I think that obviously we have to evolve with the times, and we're going to use AI because everyone's using it, and it makes a lot of things easier,\" she said. \"But I think we need to use our critical thinking skills. So if you can use it less than necessary, I encourage you to do so so that you can keep your brain sharp because if you don't use it, you lose it.\"",
          "That's a more useful framing than most of the AI-skeptic takes we hear: not an argument to opt out, but a discipline to build around opting in only when it's actually needed.",
        ],
      },
      {
        heading: "Where Wellness Comes In",
        body: [
          "Asked how her work in yoga and Pilates connects to her concerns about AI, Rachel drew a direct line between movement and the exact skills she worries AI erodes. \"I think it fights the evolution of AI because when you're doing yoga, Pilates, or any sort of movement modality, you're strengthening your mind-body connection, and that's something that AI can't do for you.\"",
        ],
      },
      {
        heading: "Why We're Featuring Rachel",
        body: [
          "We built this series to capture what women actually think about AI, not just the founders who are already all in on it. Rachel's skepticism, paired with a practical plan for managing it rather than avoiding it, represents a perspective a lot of our community shares but rarely says out loud. Her framing, use it deliberately rather than reflexively, is advice worth taking regardless of how someone feels about the technology.",
        ],
      },
      {
        heading: "Where to Find Rachel",
        body: [
          "Rachel's work spans event coordination and wellness instruction; we'll update this post with her business links as they become available.",
          "What's your honest hot take on AI? We want to hear the skepticism, not just the hype. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her, a community built for real conversations, not just AI cheerleading.",
        ],
      },
    ],
    takeaways: [
      "Use AI only when it actually saves time, not by default",
      "Protect the critical thinking and communication skills AI tends to erode",
      "Movement and mind-body practice build the exact muscle AI can't replace",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Rachel",
      businessName: "Event Coordinator; Yoga & Pilates / Wellness",
      instagramUrl: "https://www.instagram.com/p/DT2BbDnCENn/",
    },
  },
  {
    slug: "leslie-gutierrez-healthcare-ai-interview",
    title: "Leslie Gutierrez on Using AI Inside a Hospital, Not a Startup",
    description:
      "A hospital learning systems manager on using AI to build training material faster, without it touching a single patient decision.",
    publishedAt: "2026-08-05",
    readMinutes: 4,
    tags: ["Interview", "healthcare"],
    intro:
      "Healthcare is one of the industries most often mentioned in AI headlines and least often represented by the people actually doing the day-to-day work inside it. Leslie Gutierrez is one of those people, and her interview became the healthcare episode of our Ladies Let's Talk Tech series. \"In this episode of Ladies Let's Talk Tech, we dive into how AI and systems are transforming the healthcare industry,\" we wrote when the episode went up, as part of a weekly series spotlighting how AI is affecting women across different industries.",
    sections: [
      {
        heading: "What Leslie Does",
        body: [
          "Leslie works inside a hospital managing the learning systems, the training infrastructure that keeps clinical staff current on procedures, protocols, and the information they need to do their jobs safely. It's not a role that gets much attention in conversations about AI in healthcare, which tend to focus on diagnostics or patient-facing tools. But the systems that train the people delivering care are just as critical to how well that care actually works.",
        ],
      },
      {
        heading: "How She Uses AI Day to Day",
        body: [
          '"AI has become one of my, I guess I would say, partner or friend that I can look up and search for information that is valuable to me," Leslie told us. Her use case is specific to the demands of training content in a hospital setting. "When I have to look up for information, I would say if I work for information for nursing, for nurses, I can put together a format that I will need, and it just brings up the information that I need, and I can just tweak in anything that I need to tweak in, and it\'s great."',
          "That workflow, using AI to assemble a first draft of training material in the right format, then adjusting it with her own expertise, is a practical, low-drama example of AI actually saving time in a high-stakes environment.",
        ],
      },
      {
        heading: "What She'd Automate",
        body: [
          "Asked what task she'd want to automate given the chance, Leslie's answer circled back to the same theme: making information easier for people to access in a format that respects their time. \"I guess for people to look up information that can be friendly to them or professional way, I believe that is a way of looking up for something that is valuable. It always offers something that is, I guess, informative.\"",
        ],
      },
      {
        heading: "Why Her Story Belongs Here",
        body: [
          "We built the Ladies Let's Talk Tech series specifically to reach past the founders and agency owners who dominate most AI conversations. Leslie represents a huge, mostly invisible category of women doing essential operational work inside large institutions, using AI not to build a startup, but to do an already demanding job a little better. That's a version of AI adoption that deserves just as much attention as the flashier founder stories.",
        ],
      },
      {
        heading: "Where to Find Leslie",
        body: [
          "Leslie's work is focused inside hospital systems rather than a public-facing brand; we'll update this post with her links if she shares them.",
          "Do you work inside a large organization and use AI in ways nobody talks about publicly? We want to hear your story. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Let AI draft the first version of training material, then edit it with your own expertise",
      "Ask for information in the format you'll actually use, not just the raw answer",
      "Operational AI use inside a large institution counts as real adoption too",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Leslie Gutierrez",
      businessName: "Hospital Learning Systems Manager",
      instagramUrl: "https://www.instagram.com/p/DOfCphyjfZr/",
    },
  },
  {
    slug: "elisabet-real-estate-ai-interview",
    title: "Elisabet on Why AI Cannot Replace a Real Estate Agent",
    description:
      "A Miami real estate agent on why AI accelerates a deal but never replaces the human part of it.",
    publishedAt: "2026-08-07",
    readMinutes: 4,
    tags: ["Interview", "real estate"],
    intro:
      "Every industry has its version of the AI replacement fear. In real estate, Elisabet has heard the question enough times that she answers it without hesitation. We met Elisabet at a Manatech Miami N8N workshop, where she works as a real estate agent with Avanti Way, to talk about what AI actually changes for someone in her line of work, and what it doesn't.",
    sections: [
      {
        heading: "What AI Actually Does for Her Business",
        body: [
          '"AI is just a tool that you can use it to grow your business, to understand the market, to understand what\'s going on outside, to use it to empower your business and your clients to get better deals for them and better things for you as well," Elisabet told us. "So it\'s a win-win situation."',
          "That framing, AI as a research and empowerment tool rather than a replacement for the agent, runs through her entire approach to the question everyone eventually asks her.",
        ],
      },
      {
        heading: "Can AI Replace a Real Estate Agent?",
        body: [
          '"No, per se, because you need the human part always in every business," she said. "You need the people who can talk and who can understand you besides the machine. But the machine accelerates you to that process to get a better understanding and better things for your customer. So it\'s like both things together. It\'s not a replacement, it\'s a tool."',
          "That distinction between acceleration and replacement is one we hear from almost every service-based entrepreneur we interview, and Elisabet articulates it as clearly as anyone.",
        ],
      },
      {
        heading: "Her Advice for the Next Generation",
        body: [
          "Asked what she'd tell someone starting out, Elisabet's advice was about immersion, not caution. \"Put your hands on it now and study and do everything that you can with chat GPT, with perplexity, whatever you like it, but use it and implement it in your life, in your way you are doing things. And it's not something that is taking your brain out because you still need to read books and learn and do everything. Also, you need to learn how to talk to the AI.\"",
          "Her closing comparison is one worth remembering: \"It's the same as you're using TikTok and Facebook and everything that you're using now, you have to use this as something in your life. It's helping you for everything.\"",
        ],
      },
      {
        heading: "Why This Matters for Real Estate",
        body: [
          "Real estate is one of the industries most publicly speculated about when it comes to AI disruption. Elisabet's perspective, grounded in day-to-day client work rather than theory, is a useful counterweight to that speculation. The agents who will do well aren't the ones avoiding the tools. They're the ones like Elisabet, using AI to move faster while keeping the relationship at the center of the deal.",
        ],
      },
      {
        heading: "Where to Find Elisabet",
        body: [
          "You can find Elisabet's real estate work through Avanti Way, or follow her at @elisabet_comfyhouses on Instagram.",
          "If you're in a client-facing industry and want to talk through how AI fits into relationship-driven work, comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Use AI to research the market faster, not to replace the relationship",
      "Tell clients plainly: it's a tool that accelerates you, not a replacement for you",
      "Study the tools now the same way you learned any other platform",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Elisabet (Comfy Houses)",
      businessName: "Real Estate Agent, Avanti Way",
      instagramUrl: "https://www.instagram.com/p/DT-Zs04Eb7Q/",
      businessWebsite: "https://avantiway.com/",
      backlinkLabel: "Work with Elisabet at Avanti Way",
    },
  },
  {
    slug: "sydney-regulated-industries-ai-interview",
    title: "Sydney's Workaround for Using AI in Regulated Industries",
    description:
      "A management consultant's workaround for using AI with clients too regulated to type anything proprietary into a chatbot.",
    publishedAt: "2026-08-10",
    readMinutes: 5,
    tags: ["Interview", "consulting"],
    intro:
      "A lot of professionals in regulated industries treat AI as off limits entirely. Sydney, a management consultant we met at a Tech Tuesdays Miami event, found a workaround that lets her use it anyway, without putting a single client at risk.",
    sections: [
      {
        heading: "The Problem With AI in Regulated Work",
        body: [
          "Sydney's consulting clients are often federally or state regulated, which means proprietary information can't simply be typed into a chatbot. \"Because of the type of clients that I work with, usually federally and state regulated, we have to be very careful about how AI is used because of the proprietary information that could be input in there,\" she told us.",
          "Her solution is a loophole worth stealing if you work under similar constraints. \"I paraphrase in my own personal uses of like Copilot or ChatGPT and then use that to then influence the work that I'm doing. So that way, I'm playing it safe on both sides, but still being able to be efficient.\"",
          "In other words: strip the identifying and proprietary detail out, ask the general version of the question, and apply the answer back to the specific situation herself. She gets the speed of AI without ever exposing what she's not allowed to expose.",
        ],
      },
      {
        heading: "Her Advice for Anyone Entering the Field",
        body: [
          "Asked what she'd tell someone getting into consulting, Sydney's answer was less about tools and more about mindset. \"Take a chance on yourself,\" she said. \"AI allows you to experiment. You can use it to ask a bunch of different questions. And then after you've had some experience or gained more perspective, you can come back and review and reflect on what you've asked it before and then ask some of those same questions again. And by that time, you would have had more perspective. So you can re-engineer those questions a little bit better or ask them in a different way.\"",
          "That's a genuinely useful framing: your first questions to an AI tool don't have to be your best ones. Experience changes what you know to ask for.",
        ],
      },
      {
        heading: "Her Hot Take",
        body: [
          '"My hot take on AI is that it\'s not as scary as it seems," Sydney told us, "because I think that people tend to be scared of things that they\'re unsure, unaware of. So just try it because you can\'t talk about it, not be about it. So keep trying, keep experimenting."',
        ],
      },
      {
        heading: "Why This Matters for Regulated Industries",
        body: [
          "Sydney's approach is a useful case study for anyone in law, healthcare, finance, or consulting who has written off AI entirely because of compliance concerns. The tools don't have to touch sensitive data to still save real time. The discipline is in knowing exactly where the line is and staying on the right side of it.",
        ],
      },
      {
        heading: "Where to Find Sydney",
        body: [
          "You can follow Sydney's work at @magnifisyd on Instagram.",
          "If you work in a regulated field and have figured out your own workaround for using AI responsibly, we want to hear about it. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Paraphrase before you paste anything proprietary into an AI tool",
      "Your first questions to AI don't have to be your best ones",
      "Try it before deciding it's not for your regulated industry",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Sydney",
      businessName: "Management Consultant",
      instagramUrl: "https://www.instagram.com/p/DUCeg9oDbBQ/",
      backlinkLabel: "Follow Sydney (@magnifisyd)",
    },
  },
  {
    slug: "veronica-marshall-whynda-interview",
    title: "Veronica Marshall Built the Airbnb for Construction Equipment",
    description:
      "Veronica Marshall built Whynda, the Airbnb for construction equipment, and automated the unglamorous parts first.",
    publishedAt: "2026-08-13",
    readMinutes: 5,
    tags: ["Interview", "construction tech", "founder stories"],
    intro:
      "Ask most people what Airbnb did for spare rooms, and they'll tell you it turned an unused asset into income. Veronica Marshall looked at idle construction equipment and asked why nobody had done the same thing for machinery. We met Veronica at a Manatech Miami N8N workshop, where she was deep in the kind of automation work most founders never show anyone. That's exactly why we wanted to talk to her.",
    sections: [
      {
        heading: "What Veronica Built",
        body: [
          "Veronica is the founder of Whynda, a peer-to-peer rental marketplace connecting equipment owners with renters, covering everything from bulldozers and forklifts to telehandlers and aerial lifts. Equipment owners list their machinery for free and earn income from assets that would otherwise sit idle. Renters get access to equipment at market-set prices, with insurance protection and secure payments handled through the platform. Veronica also brings direct industry credibility to the business through Lifting & Racks LLC, where she works as a forklift safety trainer with more than a decade in equipment sales and rentals.",
          'In her own words, it\'s simple: Whynda is "the Airbnb for machinery."',
        ],
      },
      {
        heading: "Where AI Actually Shows Up",
        body: [
          'A lot of founders describe AI in the abstract. Veronica described it by function. "It has helped developers in speeding up the process of getting everything ready," she told us. "We\'re getting agents to do the customer service for us. In terms of marketing, it has helped with the automation, connecting all the marketing tools and making sure that everything works smoothly."',
          "That's the pattern we see in the founders who get real value out of AI: it's not one flashy feature, it's three or four unglamorous processes running quietly in the background so the founder isn't the one doing them by hand.",
        ],
      },
      {
        heading: "Her Hot Take",
        body: [
          'Asked for her honest opinion on AI, Veronica didn\'t pick a side in the hype cycle. "I am neither pro or against," she said. "I do think it does help a lot to make some tasks faster and to not waste time on small things. But at the same time, I feel like we\'re concentrating too much on AI now and we\'re forgetting about the simple things that are like reading a book or going to see a sunset."',
          "Her advice to the next generation follows the same line: \"Don't just make your life about it. Do something else. It's a beautiful world. Enjoy the display with other stuff that are not just screens or AI.\"",
        ],
      },
      {
        heading: "Why It's Worth Paying Attention To Whynda",
        body: [
          "Equipment rental is not a glamorous industry, which is exactly why it's a smart one to automate. Veronica is solving a real, unsexy operational problem for an industry most tech founders ignore, and she's doing it with the kind of grounded, tool-agnostic view of AI that we think more founders should have.",
        ],
      },
      {
        heading: "Where to Find Veronica",
        body: [
          "You can explore Whynda, or find Veronica's marketplace on Instagram at @Whyndha.Official.",
          "If you're a woman building something in an industry people assume AI can't touch, we want to hear from you. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Automate the unglamorous processes first: support, marketing hookups, admin",
      "You don't have to pick a side in the AI hype cycle to use it well",
      'An "unsexy" industry is often the smartest one to build in',
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Veronica Marshall",
      businessName: "Founder, Whynda",
      instagramUrl: "https://www.instagram.com/p/DWhA3MPiqpV/",
      businessWebsite: "https://whynda.com/",
      backlinkLabel: "See how Whynda works",
    },
  },
  {
    slug: "isabella-mongalo-dreamaker-interview",
    title: "Isabella Mongalo on Opening Her Terminal for the First Time",
    description:
      "Dreamaker founder Isabella Mongalo on opening her terminal for the first time, and why she built a room for other women to do the same.",
    publishedAt: "2026-08-17",
    readMinutes: 5,
    tags: ["Interview", "AI & marketing", "founder stories"],
    intro:
      "A lot of founders discover AI through a use case. Isabella Mongalo discovered it through her terminal, a place she never thought she, as a non-technical founder, would have any reason to open. We met Isabella at WeCreate Women Build AI Night, an event she hosted at The Lab Miami's Dock Coworking Space in Wynwood, built for women to explore AI together regardless of experience level. She wasn't just attending her own event. She was also the reason it existed.",
    sections: [
      {
        heading: "What Isabella Is Building",
        body: [
          "Isabella is the founder of Dreamaker, a platform for young professionals who want to build a meaningful life, not just a resume. The premise is that clarity about who you are and what you want isn't something you're handed, it's something you build, and most people never get the tools or the space to do that work intentionally.",
        ],
      },
      {
        heading: "How AI Changed Her Process",
        body: [
          "What stood out in our conversation was how directly Isabella credited AI with unlocking her own progress, not as a marketing tool, but as a thinking partner. \"Right now I'm in love with Claude on my terminal,\" she told us, \"because as a non-technical person, I never even considered opening up my terminal. Like, why would I need to do that? And now I'm using it, and I'm making a lot of progress and having like natural conversations with my project, and it's just amazing to me how much you can do.\"",
          'That experience became the reason WeCreate Women Build AI Night exists at all. "That\'s been the catalyst for me wanting to get more and more people like me, entrepreneurial women in general, into the world of AI," she said, "which is why I decided it was important to have a space like the event that we saw tonight, where we create so women come together and tinker with AI, ask questions, build things, because otherwise it could be very daunting."',
        ],
      },
      {
        heading: "Why This Matters Beyond One Event",
        body: [
          "Isabella's story is a good reminder that the barrier to using AI seriously is rarely the technology itself, it's the permission to try it without already being an expert. She wasn't a developer before she opened that terminal. She just decided the intimidation wasn't a good enough reason to stop.",
          "That's the same instinct behind Dreamaker: young professionals often assume clarity about their path has to arrive before they act, when in practice it tends to show up after they start building. Isabella's own AI journey is proof of the same pattern working in her favor.",
        ],
      },
      {
        heading: "Where to Find Isabella",
        body: [
          "You can learn more about Dreamaker (spelled with one M), and follow Isabella's work at @isabellavirginia__ on Instagram.",
          "Want to be in the room for the next Build With Her event or interview? Comment SKOOL on our Instagram and we'll send you the link to our free community for women building their businesses and their confidence with AI.",
        ],
      },
    ],
    takeaways: [
      "The barrier to using AI seriously is usually permission, not expertise",
      "You don't need to be technical to open the tools that feel technical",
      "Clarity tends to show up after you start building, not before",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Isabella Mongalo",
      businessName: "Founder, Dreamaker",
      instagramUrl: "https://www.instagram.com/p/DWPKMwiigLU/",
      businessWebsite: "https://www.dreamaker.ai/",
      backlinkLabel: "Explore Dreamaker",
    },
  },
  {
    slug: "sweta-gupta-gridless-global-interview",
    title: "Sweta Gupta on Bringing Women Into the Energy Industry",
    description:
      "Gridless Global CEO Sweta Gupta on automating energy feasibility studies and why she wants more women in a male-dominated fraternity.",
    publishedAt: "2026-08-20",
    readMinutes: 4,
    tags: ["Interview", "energy", "founder stories"],
    intro:
      "The energy sector doesn't come up often in conversations about AI and entrepreneurship. Sweta Gupta thinks that's exactly the problem, and she's building her company to change it. We spoke with Sweta at the Aspire conference, where she introduced herself with a list most people would need four job titles to cover: speaker, writer, engineer, traveler, and author.",
    sections: [
      {
        heading: "What Sweta Is Building",
        body: [
          "Sweta is the CEO of Gridless Global, an energy consultancy that uses AI to automate energy feasibility studies at scale, work that matters as the company expands into more countries. Her team applies AI to energy education, energy generation modeling, and root cause simulation for fault diagnostics, the kind of analysis that reduces outage downtime and, by extension, reduces the waste that drives global warming.",
          '"So many things like to be automated because I want to expand and scale to many countries," she told us. That scale is the point: feasibility studies that once required extensive manual analysis in one market can now move faster across many.',
        ],
      },
      {
        heading: "Why She's Focused on Bringing Women Into Energy",
        body: [
          "Asked what she'd tell the next generation, Sweta didn't hedge. \"I would love more people from younger generation to join the energy sector, which is predominantly very male dominated. I would request many women to please come up and face this fear because this energy industry is such a blessing and it's my fraternity for my childhood.\"",
          "That framing, an industry as a fraternity you inherit rather than a career you stumble into, says a lot about how Sweta thinks about representation. She isn't asking women to consider energy as an afterthought option. She's describing it as a birthright that's been gatekept.",
        ],
      },
      {
        heading: "Why This Belongs in Our Series",
        body: [
          "We built this interview series to cover women using AI across every industry, not just the ones already saturated with founder content. Energy consulting rarely gets that spotlight, and Sweta's work is a reminder that the industries with the least visible women in AI are often the ones where the opportunity is largest precisely because so few people are building there yet.",
          "Her additional credential, serving as a UN Peace Ambassador, reflects the same instinct that shows up in her business: she treats access and representation as part of the job, not a side project to get to later.",
        ],
      },
      {
        heading: "Where to Find Sweta",
        body: [
          "You can connect with Sweta Gupta and follow her work at Gridless Global through her LinkedIn profile.",
          "If you're a woman working in an industry that doesn't get enough AI coverage, we want to feature your story too. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Look for the industries with the least visible women in AI, that's where the opening is",
      "Automation lets one feasibility study become a repeatable process across markets",
      "Treat representation as part of the job, not a side project",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Sweta Gupta",
      businessName: "CEO, Gridless Global",
      instagramUrl: "https://www.instagram.com/p/DUYMrZYEdYo/",
      backlinkLabel: "Connect with Sweta Gupta on LinkedIn",
    },
  },
  {
    slug: "maria-mendez-real-estate-interview",
    title: "Maria Mendez on Being Honest About Feeling Behind on AI",
    description:
      "A Palm Beach County broker admits AI is hard for her, then explains why that is exactly the reason to start learning it now.",
    publishedAt: "2026-08-23",
    readMinutes: 4,
    tags: ["Interview", "real estate"],
    intro:
      "Most people who feel behind on a new technology talk themselves out of it. Maria Mendez, a real estate agent and broker in Palm Beach County, told us the opposite: being behind on AI is exactly the reason to start learning it today. We caught up with Maria at the Aspire conference, her second time attending, where she was refreshingly honest about where she stands with AI as a working real estate professional.",
    sections: [
      {
        heading: "A Career Built on Showing Up",
        body: [
          'Maria has built her real estate business in Palm Beach County on the kind of steady, in-person credibility that doesn\'t come from a single viral post. Attending industry conferences like Aspire is part of how she stays current. "I think they are very well organized," she told us, "and the knowledge that they give us, I believe for such a little money, is wonderful. It\'s a lot of knowledge and a lot of wonderful people that you meet here."',
        ],
      },
      {
        heading: "Her Honest Take on AI",
        body: [
          "What stood out most in our conversation was Maria's candor. \"AI is a little challenging for me,\" she admitted, without any of the defensiveness that usually comes with that admission. Instead of stopping there, she turned it into advice for people with more runway than she has left in her own career. \"But if I'm younger, what I will do, I will learn all the AI I can. I think it's an amazing industry, and I think there's a lot of money to be made of in that industry.\"",
          "That's a distinction worth sitting with. Maria isn't dismissing AI because it's hard for her to pick up. She's pointing at it as one of the biggest opportunities available to whoever is willing to learn it early, even while acknowledging she's still working on her own comfort with it.",
        ],
      },
      {
        heading: "Why Her Perspective Matters",
        body: [
          "A lot of AI coverage skips straight to the founders who were early adopters and already fluent. Maria's perspective is more useful for most working professionals: you don't have to be an expert to see the opportunity clearly, and admitting you're still learning doesn't disqualify you from encouraging the next generation to get ahead of it.",
        ],
      },
      {
        heading: "Where to Find Maria",
        body: [
          "You can find Maria Mendez Real Estate on Instagram and Facebook, where she shares her work across Palm Beach County.",
          "If you're navigating a new skill or technology in your own business and want a community that won't make you feel behind, comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Admitting AI is hard for you doesn't disqualify you from recommending it to others",
      "The opportunity is often biggest in the tools you feel most behind on",
      "Keep showing up to the rooms where the knowledge actually gets shared",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Maria Mendez",
      businessName: "Real Estate Agent/Broker, Palm Beach County",
      instagramUrl: "https://www.instagram.com/p/DUHcMRZEW5D/",
      backlinkLabel: "Follow Maria Mendez Real Estate",
    },
  },
  {
    slug: "bri-marie-hair-interview",
    title: "Bri Marie on Scaling a Celebrity Hair Business Into Coaching",
    description:
      "Celebrity hairstylist Bri Marie on scaling from the chair into coaching and digital offers, and why she keeps God and ChatGPT in the same sentence.",
    publishedAt: "2026-08-28",
    readMinutes: 5,
    tags: ["Interview", "beauty & hair", "founder stories"],
    intro:
      "When a hairstylist's client list includes Drake, most people would stop the story there. Bri Marie, known professionally as Bri Marie Hair and born Brianna McBean, treats that credential as one chapter, not the whole book. We caught up with Bri Marie at the Aspire conference in Miami, where she wasn't there to network for herself first. She came to support a friend who was speaking, and ended up giving us one of the most grounded conversations of the series.",
    sections: [
      {
        heading: "Miami-Born, Built on Her Own Terms",
        body: [
          "Bri Marie is a celebrity hairstylist based in Miami, with a client roster and press coverage that reach well beyond the chair, including recognition for her work with Drake. But the identity she led with in our conversation wasn't the celebrity clientele. \"I'm out here in Miami and I also have a podcast where I impact the gospel into everyday life,\" she told us, \"basically changing and giving people perspective shifts on how they think they're supposed to be living versus what God's way is.\"",
          "That combination, a celebrity-level hair business alongside a faith-based podcast, is exactly the kind of multi-dimensional story we built this series to find.",
        ],
      },
      {
        heading: "Why She Came to Aspire",
        body: [
          '"I\'m actually here to support my homegirl, Arielle Pryor. She\'s actually going to be speaking in a little bit, so I just came to support her," Bri Marie said, "but also get more acquainted with more networking events because that was actually one of my goals for 2026."',
          "That's a detail worth highlighting on its own. A stylist with celebrity clients still treats networking as a goal to work toward, not something she's already arrived at.",
        ],
      },
      {
        heading: "Where AI Fits Into Her Business",
        body: [
          'Bri Marie\'s podcast focuses on how women use AI in business, and her own use is centered on scaling beyond the chair. "Right now it\'s all about systems," she told us. "So I am coming out with coaching offers. There\'s a lot of people that want mentorships, digital offers as well. So like, you know, many chat and things like that."',
          'Her take on the tools themselves was direct: "Chat GPT works. Chat GPT is a good platform. We love chat GPT. Chat GPT is an amazing platform to use, you know, leverage ideas." But she was equally clear that the tool doesn\'t replace judgment. "We don\'t know everything, and it\'s good to, you know, we live in a world right now where everything is fast paced. So if you want to ask a question, different ways that you can scale your business, scale your brand, can definitely help you 10x your speed of the process."',
          "For a hairstylist looking to scale out of the chair into coaching and digital offers, that speed matters. Asking the right questions is how she's mapping her own transition from service provider to educator.",
        ],
      },
      {
        heading: "Her Advice",
        body: [
          "Asked what she'd tell someone starting out, Bri Marie kept it simple and personal. \"Keep God first. God is everything. Once you have Him, all your steps will be ordered. Without Him, you have nothing. That's what I've done for my life.\"",
        ],
      },
      {
        heading: "Where to Find Bri Marie",
        body: [
          "You can follow Bri Marie's hair work and her podcast at @thebrimarieway on Instagram.",
          "If you're building a business that scales beyond the service you started with, like Bri Marie moving from styling into coaching and digital offers, comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Use AI to draft systems and offers, then apply your own judgment to what it gives you",
      "A single skill can support more than one business model, chair work and coaching both",
      "Keep asking better questions, speed compounds once you know what to ask",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Bri Marie",
      businessName: "Bri Marie Hair (celebrity hairstylist, Miami/Pembroke Pines)",
      instagramUrl: "https://www.instagram.com/p/DT3DxddkcOP/",
      backlinkLabel: "Follow Bri Marie Hair",
    },
  },
  {
    slug: "sommer-curry-designs-by-sommer-interview",
    title: "Sommer Curry Is Teaching AI to the Generation Everyone Assumes Is Behind",
    description:
      "A Homestead salon owner teaching AI basics to the generation the tech industry assumes is behind.",
    publishedAt: "2026-08-31",
    readMinutes: 5,
    tags: ["Interview", "beauty & hair", "wellness"],
    intro:
      "Most AI content is aimed at people who already grew up online. Sommer Curry built a piece of her business teaching AI to the generation everyone assumes is behind on it, and she's doing it from a hair salon. We met Sommer at the Aspire conference in Miami, where she talked about her two businesses in the same breath, because in her world they aren't separate at all.",
    sections: [
      {
        heading: "Two Businesses, One Philosophy",
        body: [
          "Sommer is the founder of the Sommer Curry Experience, a wellness, health, and fitness consulting practice, and she's also the owner of Designs by Sommer, a hair salon based in Homestead, Florida that she describes as the first and only consultant-and-salon hybrid in the area. With 15 years of experience in hair care, she built the salon around a simple belief: \"beauty isn't just about how you look, it's about how you feel.\"",
          "That same belief runs through her consulting work. Beauty, wellness, and business all sit on the same foundation for Sommer, which is part of why she has expanded into teaching AI basics to an audience most tech content skips over entirely.",
        ],
      },
      {
        heading: "Teaching AI to a Generation the Industry Ignores",
        body: [
          '"Right now we are also teaching AI," Sommer told us. "So I also teach AI for the generation who are 30 and above. We teach you the basis of ChatGPT. We teach you how to put your business on automation."',
          'Her reasoning is blunt and business-first. "Moving into the digital age, within the next three years, we need to be moving forward and not behind. So if you are still looking for employees in your business, you are falling behind. You need to be putting your business on automation. So that way when you step away and attend events like Aspire, your business is on autopilot and you are not losing the revenue."',
          'Her line about picking up the phone stuck with us: "When you pick up the phone, you need to be picking up the money call." Every hour spent on a task automation could have handled is an hour not spent on the call that actually grows the business.',
        ],
      },
      {
        heading: "Her Advice for Young Entrepreneurs",
        body: [
          'Asked what she\'d tell someone just starting out, Sommer didn\'t lead with hustle culture. "Do the work," she said. "Yes, it is amazing to look the part. But also as you are looking the part, make sure that you are doing the work and putting out factual content and resources that your audience can truly use."',
        ],
      },
      {
        heading: "Why Her Story Matters",
        body: [
          "Sommer's business is proof that automation isn't reserved for software companies. A salon owner in Homestead is using the same underlying tools as a Miami tech founder, applied to booking, client communication, and freeing up her own time to teach other women how to do the same. Her upcoming salon milestone, covered by FIU's GrowBiz program under the line \"I bet on myself,\" reflects the same instinct that shows up in her AI teaching: build the system first, then bet on yourself to run it.",
        ],
      },
      {
        heading: "Where to Find Sommer",
        body: [
          "You can book with Designs by Sommer, and find her consulting work and daily insights at @sommerexp on Instagram.",
          "If you're 30 or older and think AI passed you by, it didn't. Comment SKOOL on our Instagram and we'll send you the link to join Build With Her, our free community for women learning AI and business together.",
        ],
      },
    ],
    takeaways: [
      "Put your business on automation before you need to step away from it",
      "Teaching a skill to an overlooked age group can be its own business line",
      "Do the work behind the image, factual content beats looking the part",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Sommer Curry",
      businessName: "Designs by Sommer + The Sommer Curry Experience",
      instagramUrl: "https://www.instagram.com/p/DWRvQqBio-f/",
      businessWebsite: "https://designsbysommer.com/",
      backlinkLabel: "Book with Designs by Sommer",
    },
  },
  {
    slug: "alexandra-silva-labarr-show-up-scared-interview",
    title: "Alexandra Silva Labarr on Why Fear Is a Green Light, Not a Stop Sign",
    description:
      "Show Up Scared author Alexandra Silva Labarr on treating fear as a green light instead of a stop sign, in business and in AI.",
    publishedAt: "2026-09-05",
    readMinutes: 5,
    tags: ["Interview", "authors", "mindset"],
    intro:
      "Most advice about fear tells you to get rid of it first, then act. Alexandra Silva Labarr built her entire book, and a good part of her business, around the opposite idea. We met Alexandra backstage at the Elevate Conference for a behind-the-scenes conversation about her memoir, Show Up Scared, and the teen edition that followed it. What came out of that conversation was less a book pitch and more a working philosophy for anyone trying to build something while still afraid of it.",
    sections: [
      {
        heading: "The Book Behind the Name",
        body: [
          "Show Up Scared is Alexandra's memoir, and every chapter, she told us, is a reflection of a moment where life tried to stop her and she kept going anyway. \"This book is going to help you if you're struggling with fear that's holding you back from getting to the other side of your life, your opportunities,\" she said.",
          "The book is built around what she calls the Feel Forward Method, a framework she has since brought to stages and to younger audiences through the teen edition, now available alongside the original on Amazon. The core reframe is simple to say and hard to practice: fear isn't a stop sign. It's a green light telling you to move forward instead of freezing.",
        ],
      },
      {
        heading: "Fear in the Age of AI",
        body: [
          'We asked Alexandra why showing up scared still matters now, with AI changing how so many businesses operate. Her answer didn\'t dodge the tool, it just refused to let it replace the harder work. "AI is not going anywhere," she told us, "so it is important to learn how you can use it to benefit you. Every business is different. You don\'t need to learn every single thing, but learn about how you can maximize AI within your specific business."',
          "That's advice we repeat often in this community: AI is not a strategy on its own. It's a tool that only works once you already know what you're trying to build.",
        ],
      },
      {
        heading: "Failure Isn't a Stop Sign Either",
        body: [
          'Asked what she\'d tell the next generation of women entering entrepreneurship, Alexandra didn\'t sand down the hard parts. "Failure is not a stop sign either. It means we\'re growing," she said. "How do you know how to do it better? How do you know what challenges you need to face? How do you know how you can do it better unless you fail? So keep showing up, show up scared."',
          "Her second piece of advice is one we build our whole community around: find your people. \"Find your who's. Find the people who believe in you. Find the people that you can connect to. I'm known as a networking queen for a reason. Connections are important. Let's collapse time. Let's get to where we're going faster by finding the right people in our corner.\"",
        ],
      },
      {
        heading: "Why Her Story Fits Build With Her",
        body: [
          "Alexandra's message lines up with something we see constantly in our own interviews with women entrepreneurs: the ones who move fastest aren't the ones with the least fear, they're the ones who stopped waiting for the fear to go away before they started.",
        ],
      },
      {
        heading: "Where to Find Alexandra",
        body: [
          "You can find Alexandra Silva Labarr's work and her book Show Up Scared, including the teen edition, or follow her across social media under her own name.",
          "If her story resonated, comment SKOOL on our Instagram and we'll send you the link to join Build With Her, our free community for women learning to build with AI without losing themselves in the process.",
        ],
      },
    ],
    takeaways: [
      "Treat fear as a signal to move forward, not a reason to stop",
      "Learn how AI applies to your specific business, not everything about AI",
      "Find your people, connections compress how long everything else takes",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Alexandra Silva Labarr",
      businessName: "Author, Show Up Scared (memoir + teen edition)",
      instagramUrl: "https://www.instagram.com/p/DW6XkGKjnUo/",
      businessWebsite: "https://www.alexandrasilvalabarr.com/",
      backlinkLabel: "Read Show Up Scared by Alexandra Silva Labarr",
    },
  },
  {
    slug: "karen-joseph-beautifully-fed-interview",
    title: "Karen Joseph: The Real Biohack Is the Body You Already Have",
    description:
      "Wellness founder Karen Joseph on the real biohack: the body you already have, not the next gadget at a biohacking conference.",
    publishedAt: "2026-09-09",
    readMinutes: 5,
    tags: ["Interview", "wellness"],
    intro:
      "A biohacking conference is full of gadgets promising to add years to your life. Karen Joseph, MPH, walked through one and landed on the opposite conclusion: the best technology in the room was never for sale. It was already running the whole time, inside every person there. We caught up with Karen at the Unleash Your Superpower Biohacking and Business Conference for an episode of our street-style interview series, where we sit down with women entrepreneurs to talk about how they are actually using AI and systems in their businesses, not the version of AI you read about in headlines.",
    sections: [
      {
        heading: "Who Karen Joseph Is",
        body: [
          'Karen runs Beautifully Fed, a wellness platform built around a simple idea: health advice should fit into a real life, not replace one. She holds a Master of Public Health and has built a following as "the voice of health and wellness," translating research into something a busy woman can actually use on a Tuesday.',
          "At the conference, Karen was working, not just attending. She partners with CCJ 360 Photo Booth, capturing moments and interviewing guests for event organizers, which is how the two of us ended up on camera together in the first place.",
        ],
      },
      {
        heading: "The Real Biohack",
        body: [
          'Asked for her key takeaway from a room full of longevity tech, Karen didn\'t point to a device. "When I hear biohacking, I sometimes get the ick," she told us, "because there\'s so much technology that people are creating to biohack your life and create longevity. And the true biohack is our body is the technology."',
          "Her point isn't anti-technology. It's a reminder that the fundamentals still carry the most weight: movement, your thoughts, the food you eat. \"All this other stuff is extra,\" she said, \"but dance, think about your thoughts, the food that you're eating, that's the true biohacks.\"",
          "For the women entrepreneurs in our community, that's a useful gut check. It is easy to chase the next app or the next system and forget that the system only works if the person running it is taking care of herself first.",
        ],
      },
      {
        heading: "Why This Matters for Women Building Businesses",
        body: [
          "We talk to a lot of founders who treat their own health as the thing they'll get to once the business is stable. Karen's work argues the opposite order: the body is the foundation the business gets built on, not a reward for building it. That reframe matters especially for women running lean teams or solo operations, where there is no one else to cover for a body that's running on empty.",
          "Karen's public health background gives her wellness content a research backbone that a lot of biohacking culture skips past. She isn't selling a shortcut. She's translating what the evidence actually says into language that doesn't require a science degree to follow.",
        ],
      },
      {
        heading: "Where to Find Karen",
        body: [
          "You can find Karen Joseph's work at Beautifully Fed, where she covers wellness that's meant to meet real life instead of fighting it, and follow her as @iambeautifullyfed on Instagram.",
          "Want more conversations like this one? We're building a free community for women entrepreneurs who are learning to use AI and smart systems without losing the woman at the center of the business. Comment SKOOL on any of our interview reels on Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "The fundamentals, movement, thought, food, still carry the most weight",
      "Take care of the body running the business before you chase the next system",
      "Translate research into something usable on an ordinary day",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Karen Joseph",
      businessName: "Beautifully Fed / The Voice of Health & Wellness",
      instagramUrl: "https://www.instagram.com/p/DXFZjTKiphI/",
      businessWebsite: "https://www.beautifullyfed.com/",
      backlinkLabel: "Visit Karen Joseph at Beautifully Fed",
    },
  },
  {
    slug: "bebe-foxx-ai-board-of-directors-interview",
    title: "Bebe Foxx's AI Board of Directors Includes Oprah and Mark Zuckerberg",
    description:
      "Bebe Foxx runs three careers at once with an AI board of directors that includes Oprah and Mark Zuckerberg.",
    publishedAt: "2026-09-13",
    readMinutes: 5,
    tags: ["Interview", "entertainment", "founder stories"],
    intro:
      'Most people use ChatGPT to draft an email. Bebe Foxx uses it to run strategy sessions with versions of Oprah and Mark Zuckerberg. We caught up with Bebe at the Aspire conference, where she summed up her entire approach to entrepreneurship in four words before we even got to AI: "try everything, try everything."',
    sections: [
      {
        heading: "A Career That Refuses to Pick One Lane",
        body: [
          "Bebe doesn't run a single business, she runs several at once. She works in unified communications within the tech industry, she's a performer with a show at the Hard Rock on the calendar, and she's also active in insurance. Asked to describe herself in one sentence, we landed on \"multi-talented dimensional conglomerate,\" and it fit.",
          "Running that many lanes at once is exactly the kind of situation where most people either burn out or let something slide. Bebe's answer to that problem is the part of the conversation we found most useful.",
        ],
      },
      {
        heading: "Her AI Board of Directors",
        body: [
          '"ChatGPT is my best friend. It\'s my sister," Bebe told us. Her process is specific: she tells it her talents, describes what she wants to do, and asks for a step-by-step plan broken down simply enough to follow without overthinking it. Then she goes further. "I\'ve also asked it, if you were Oprah or if you were Mark Zuckerberg, what advice would you give me in this situation?"',
          'We called that an AI board of directors, and Bebe owned the phrase immediately. "That\'s my board, I\'m telling you." She uses the same approach across every part of her work, including unified communications, where she asks it to help build a daily schedule and then holds herself to following it. "We stick to the plan. No feelings, we stick to the plan."',
        ],
      },
      {
        heading: "Where the Execution Actually Comes From",
        body: [
          'Bebe was clear that the plan is the easy part. "It\'s the execution," she said. "However, when I was in high school, I had a very drill sergeant coach. So it\'s ingrained in me to just do it without thinking." That\'s a detail worth sitting with: the tool gives you the plan, but the discipline to execute it still has to come from somewhere else.',
        ],
      },
      {
        heading: "Her Advice for the Next Generation",
        body: [
          "Asked what she'd tell younger women starting out, Bebe kept it practical and a little scrappy. \"Try everything. Go by yourself, even if you need to. Your heart and being kind to people will open up doors for you, even if money is the issue. Get an internship if you can and keep on going. Even if it's hard. If you have to walk, if you have to take the bus, keep going. You'll make it.\"",
        ],
      },
      {
        heading: "Why We're Featuring Bebe",
        body: [
          "Bebe's approach is a useful counterpoint to the idea that AI only works for founders with one clear niche. She's proof that the same tool that helps a single-focus founder plan a launch can also help someone juggling multiple careers make decisions faster and stay accountable to a plan she'd otherwise talk herself out of.",
        ],
      },
      {
        heading: "Where to Find Bebe",
        body: [
          "You can follow Bebe Foxx and catch updates on her performances and work across unified communications, entertainment, and insurance at @bebe.foxx on Instagram.",
          "Want more real conversations about how women are actually using AI day to day? Comment SKOOL on our Instagram and we'll send you the link to join Build With Her.",
        ],
      },
    ],
    takeaways: [
      "Ask AI for a plan, then supply the discipline to execute it yourself",
      'Build an "AI board of directors" by asking it to answer as people you admire',
      "Juggling multiple lanes is easier when a tool helps you stay accountable to the plan",
    ],
    cta: { label: "Book your own founder interview", to: "/podcast" },
    interview: {
      guestName: "Bebe Foxx",
      businessName: "Unified communications, entertainment, and insurance",
      instagramUrl: "https://www.instagram.com/p/DWWaYBYkTrk/",
      backlinkLabel: "Follow Bebe Foxx",
    },
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
