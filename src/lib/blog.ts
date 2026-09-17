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
