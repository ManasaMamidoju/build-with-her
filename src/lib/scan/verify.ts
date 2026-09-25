import type { WeightedFix } from "@/lib/bingo";
import type { AiVisibility } from "@/lib/scan/ai-visibility.server";
import type { FacebookScan, GoogleScan, InstagramScan, TikTokScan } from "@/lib/scan/apify.server";
import type { WebsiteScan } from "@/lib/scan/website.server";

/** Everything the live scan found, stored on the submission as answers.scan. */
export type ScanData = {
  status: "running" | "done" | "failed";
  startedAt: string;
  finishedAt?: string;
  city: string | null;
  service: string | null;
  website: WebsiteScan | null;
  instagram: InstagramScan | null;
  tiktok: TikTokScan | null;
  facebook: FacebookScan | null;
  google: GoogleScan | null;
  ai: AiVisibility | null;
  /** Which parts were asked for but could not be checked (no key, timeout, blocked). */
  unchecked: string[];
  emailed?: boolean;
};

export type Verification = { value: boolean; evidence: string };

export type ScanCheck = {
  label: string;
  status: "pass" | "fail" | "info";
  detail: string;
};

const isBooking = (url: string | null | undefined) =>
  Boolean(
    url &&
    /calendly|square\.site|squareup|vagaro|glossgenius|acuity|as\.me|booksy|fresha|styleseat|schedulicity|mindbody|boulevard|blvd|setmore|timely|zenoti|mangomint|phorest|booker|simplybook|janeapp/i.test(
      url,
    ),
  );

/**
 * Turn raw scan data into: squares the scan can confirm or rule out,
 * extra fixes only the scan can see, and a readable checklist.
 * Only confident signals change a square; absence of evidence mostly doesn't.
 */
export function deriveFromScan(scan: ScanData) {
  const verified: Record<string, Verification> = {};
  const extraFixes: WeightedFix[] = [];
  const forceFixIds: string[] = [];
  const checks: ScanCheck[] = [];
  const { website: site, instagram: ig, tiktok: tt, facebook: fb, google: g, ai } = scan;
  const siteOk = Boolean(site?.ok);

  /* Website ---------------------------------------------------------- */
  if (site) {
    if (!site.ok) {
      checks.push({ label: "Website", status: "fail", detail: `We could not open ${site.url}.` });
      extraFixes.push({
        squareId: "scan_site_down",
        area: "source",
        title: "Fix your website so it loads for everyone",
        how: `We could not open ${site.url}. If people and search engines cannot load it, it cannot rank or be quoted by AI.`,
        tags: ["SEO", "AEO", "GEO"],
        weight: 10,
      });
    } else {
      checks.push({
        label: "Website",
        status: site.https ? "pass" : "fail",
        detail: `${site.https ? "Loads securely" : "Loads without https"}${site.ms ? ` in ${(site.ms / 1000).toFixed(1)}s` : ""}.`,
      });
      if (!site.https) {
        extraFixes.push({
          squareId: "scan_https",
          area: "source",
          title: "Turn on https for your website",
          how: "Browsers mark sites without https as 'Not secure' and Google ranks them lower. Most hosts turn it on for free in one click.",
          tags: ["SEO"],
          weight: 6,
        });
      }
      if (!site.title || !site.metaDescription) {
        extraFixes.push({
          squareId: "scan_meta",
          area: "clarity",
          title: "Write a page title and description that say what you do and where",
          how: `Your homepage is missing ${!site.title ? "a title" : "a meta description"}. Use: '[Service] in [City] | [Business name]' and one sentence on who it's for. It is what Google shows in results.`,
          tags: ["SEO", "AEO"],
          weight: 6,
        });
      }
      checks.push({
        label: "Business schema",
        status: site.hasLocalBusinessSchema ? "pass" : "fail",
        detail: site.hasLocalBusinessSchema
          ? "Your site tells search engines it's a local business."
          : "No LocalBusiness structured data found.",
      });
      if (!site.hasLocalBusinessSchema) {
        extraFixes.push({
          squareId: "scan_schema",
          area: "source",
          title: "Add LocalBusiness schema to your website",
          how: "A small block of structured data that tells Google and AI tools your name, service, address, hours and prices in a format they read directly.",
          tags: ["SEO", "AEO"],
          weight: 5,
        });
      }
      if (site.blocksAiCrawlers.length) {
        checks.push({
          label: "AI crawlers",
          status: "fail",
          detail: `Your robots.txt blocks ${site.blocksAiCrawlers.join(", ")}.`,
        });
        extraFixes.push({
          squareId: "scan_ai_blocked",
          area: "source",
          title: "Stop blocking AI assistants from reading your site",
          how: `Your robots.txt blocks ${site.blocksAiCrawlers.join(", ")}, so ChatGPT and friends cannot read or recommend you. Remove those Disallow lines.`,
          tags: ["AEO", "GEO"],
          weight: 8,
        });
      } else {
        checks.push({
          label: "AI crawlers",
          status: "pass",
          detail: "AI assistants are allowed to read your site.",
        });
      }
      if (!site.hasViewport) {
        extraFixes.push({
          squareId: "scan_mobile",
          area: "land",
          title: "Make your website work on phones",
          how: "Your homepage has no mobile viewport setting, so it likely shows tiny text on phones. Most of your clients will find you on a phone.",
          tags: ["SEO"],
          weight: 7,
        });
      }

      verified["faq"] = {
        value: site.hasFaq,
        evidence: site.hasFaq ? "FAQ found on your website" : "No FAQ found on your homepage",
      };
      if (site.priceCount >= 2) {
        verified["services_priced"] = {
          value: true,
          evidence: `${site.priceCount} prices on your website`,
        };
      } else if (site.priceCount === 0) {
        verified["services_priced"] = {
          value: false,
          evidence: "No prices found on your homepage",
        };
      }
      if (site.mentionsCity !== null && scan.city) {
        verified["neighborhood"] = {
          value: site.mentionsCity,
          evidence: site.mentionsCity
            ? `Your website mentions ${scan.city}`
            : `Your homepage never says ${scan.city}`,
        };
      }
      if (site.mentionsBeforeAfter) {
        verified["before_after"] = { value: true, evidence: "Before-and-after on your website" };
      }
    }
  } else {
    checks.push({ label: "Website", status: "fail", detail: "No website given." });
    extraFixes.push({
      squareId: "scan_no_site",
      area: "source",
      title: "Get a simple website on your own domain",
      how: "One page with your services, prices, city, reviews and a booking button. Google and AI assistants need a page they can read and link to; social profiles alone rarely get recommended.",
      tags: ["SEO", "AEO", "GEO"],
      weight: 10,
    });
  }

  /* Booking ---------------------------------------------------------- */
  const bioLinks = [ig?.link, tt?.link, fb?.website].filter(Boolean) as string[];
  const bookingInBio = bioLinks.some((l) => isBooking(l));
  const siteBooking = siteOk && site!.hasBookingLink;
  if (siteBooking || bookingInBio) {
    verified["book_online"] = {
      value: true,
      evidence: siteBooking
        ? "Booking link found on your website"
        : "Booking link found in your bio",
    };
  } else if (siteOk && !bioLinks.length) {
    verified["book_online"] = {
      value: false,
      evidence: "No online booking link found anywhere we looked",
    };
  }
  if (ig?.found) {
    verified["booking_bio"] = ig.link
      ? {
          value: true,
          evidence: `Instagram bio links to ${ig.link.replace(/^https?:\/\//, "").slice(0, 40)}`,
        }
      : { value: false, evidence: "Your Instagram bio has no link" };
  }
  checks.push({
    label: "Online booking",
    status: siteBooking || bookingInBio ? "pass" : "fail",
    detail:
      siteBooking || bookingInBio
        ? "Clients can find a booking link."
        : "We could not find a booking link on your site or in your bios.",
  });

  /* Social ----------------------------------------------------------- */
  const recent = [ig, tt].filter((p): p is InstagramScan | TikTokScan =>
    Boolean(p?.found && p.daysSinceLastPost !== null),
  );
  if (recent.length) {
    const freshest = Math.min(...recent.map((p) => p.daysSinceLastPost!));
    verified["posted_work"] = {
      value: freshest <= 7,
      evidence:
        freshest <= 7
          ? `Last post ${Math.max(0, Math.round(freshest))} day(s) ago`
          : `Last post was ${Math.round(freshest)} days ago`,
    };
  }
  if (ig?.captionsMentionBeforeAfter) {
    verified["before_after"] = { value: true, evidence: "Before-and-after posts on Instagram" };
  }
  for (const [label, p] of [
    ["Instagram", ig],
    ["TikTok", tt],
    ["Facebook", fb],
  ] as const) {
    if (!p) continue;
    const followers =
      p.followers !== null ? `${p.followers.toLocaleString("en-US")} followers` : "";
    const last =
      "daysSinceLastPost" in p && p.daysSinceLastPost !== null
        ? `, last post ${Math.round(p.daysSinceLastPost)}d ago`
        : "";
    checks.push({
      label,
      status: p.found ? "pass" : "fail",
      detail: p.found
        ? `Found${followers ? `: ${followers}` : ""}${last}.`
        : "We could not find this profile.",
    });
  }
  if (ig?.found && (!ig.bio || ig.bio.length < 25)) {
    forceFixIds.push("bio_who");
  }

  /* Google Business Profile ----------------------------------------- */
  if (g) {
    if (!g.found) {
      checks.push({
        label: "Google Business Profile",
        status: "fail",
        detail: `Not found on Google Maps for "${g.query}".`,
      });
      verified["gbp_updated"] = { value: false, evidence: "No Google Business Profile found" };
      extraFixes.push({
        squareId: "scan_gbp_missing",
        area: "source",
        title: "Create and verify your Google Business Profile",
        how: "We could not find you on Google Maps. It's free (business.google.com) and it is the single biggest source of local clients and AI recommendations.",
        tags: ["SEO", "GEO", "AEO"],
        weight: 11,
      });
    } else {
      const bits = [
        g.rating !== null ? `${g.rating}★` : null,
        g.reviews !== null ? `${g.reviews} reviews` : null,
        g.photos !== null ? `${g.photos} photos` : null,
      ].filter(Boolean);
      checks.push({
        label: "Google Business Profile",
        status: g.unclaimed ? "fail" : "pass",
        detail: `${g.unclaimed ? "Found but NOT claimed" : "Found"}${bits.length ? `: ${bits.join(", ")}` : ""}.`,
      });
      if (g.unclaimed) {
        extraFixes.push({
          squareId: "scan_gbp_unclaimed",
          area: "source",
          title: "Claim your Google Business Profile",
          how: "Your listing exists but nobody has claimed it, so you can't add photos, services or reply to reviews. Claim it at business.google.com.",
          tags: ["SEO", "GEO"],
          weight: 11,
        });
      }
      if (g.reviews !== null && g.reviews >= 10) {
        verified["ask_reviews"] = { value: true, evidence: `${g.reviews} Google reviews` };
      }
      if ((g.reviews ?? 0) < 25 || (g.rating ?? 5) < 4.5) {
        extraFixes.push({
          squareId: "scan_reviews",
          area: "elevate",
          title: `Grow your Google reviews${g.reviews !== null ? ` past ${g.reviews}` : ""}`,
          how: "Aim for 25+ reviews at 4.5★ or higher. Text every happy client your review link the same day and ask them to mention the service by name.",
          tags: ["SEO", "GEO", "AEO"],
          weight: 7,
        });
      }
      if ((g.photos ?? 0) < 10) {
        extraFixes.push({
          squareId: "scan_gbp_photos",
          area: "attract",
          title: "Add at least 10 real photos to your Google profile",
          how: "Profiles with photos get far more calls and direction requests. Add your space, your work and yourself.",
          tags: ["SEO", "GEO"],
          weight: 5,
        });
      }
    }
  }

  /* AI answers -------------------------------------------------------- */
  if (ai) {
    checks.push({
      label: "AI answers",
      status: ai.mentioned ? "pass" : "fail",
      detail: ai.mentioned
        ? `An AI assistant recommended you${ai.position ? ` at #${ai.position}` : ""} for "${ai.query}".`
        : `Not recommended for "${ai.query}".`,
    });
    // She may have ticked mystery #1; if AI says otherwise, it goes on her list anyway.
    if (!ai.mentioned) forceFixIds.push("mystery_1");
  }

  for (const part of scan.unchecked) {
    checks.push({ label: part, status: "info", detail: "Could not check this time." });
  }

  return { verified, extraFixes, forceFixIds, checks };
}

/** Self-reported card with the scan's confident answers applied on top. */
export function applyVerification(
  checked: Record<string, boolean>,
  verified: Record<string, Verification>,
) {
  const next = { ...checked };
  for (const [id, v] of Object.entries(verified)) next[id] = v.value;
  return next;
}
