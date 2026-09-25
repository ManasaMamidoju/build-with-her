/**
 * Website scan: one fetch of the homepage plus robots.txt and llms.txt.
 * Plain fetch and pattern matching so it runs on Workers (no DOM).
 */

export type WebsiteScan = {
  ok: boolean;
  error?: string;
  url: string;
  finalUrl?: string;
  https: boolean;
  status?: number;
  ms?: number;
  title?: string | undefined;
  metaDescription?: string | undefined;
  hasViewport: boolean;
  h1Count: number;
  schemaTypes: string[];
  hasLocalBusinessSchema: boolean;
  hasFaq: boolean;
  bookingLinks: string[];
  hasBookingLink: boolean;
  priceCount: number;
  mentionsBeforeAfter: boolean;
  mentionsCity: boolean | null;
  hasPhoneLink: boolean;
  socialLinks: string[];
  imgCount: number;
  imgMissingAlt: number;
  blocksAiCrawlers: string[];
  hasLlmsTxt: boolean;
  hasSitemap: boolean;
};

const BOOKING_HOSTS = [
  "calendly.com",
  "square.site",
  "squareup.com",
  "vagaro.com",
  "glossgenius.com",
  "acuityscheduling.com",
  "as.me",
  "booksy.com",
  "fresha.com",
  "styleseat.com",
  "schedulicity.com",
  "mindbodyonline.com",
  "boulevard.io",
  "joinblvd.com",
  "setmore.com",
  "timely.com",
  "gettimely.com",
  "zenoti.com",
  "mangomint.com",
  "phorest.com",
  "booker.com",
  "simplybook.me",
  "janeapp.com",
  "wix.com/booking",
];

const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot"];

export function isBookingUrl(url: string) {
  const lower = url.toLowerCase();
  return BOOKING_HOSTS.some((host) => lower.includes(host));
}

/** Accepts "mysite.com", "https://mysite.com/x"; refuses anything that is not a public web host. */
export function normalizeWebsite(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (
    !host.includes(".") ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host.includes(":")
  ) {
    return null;
  }
  return url;
}

async function fetchText(url: string, timeoutMs: number, maxBytes = 1_500_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BuildWithHerFindabilityScan/1.0; +https://buildwithhermedia.com/bingo)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    const text = (await response.text()).slice(0, maxBytes);
    return { response, text, ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

function textOf(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function collectSchemaTypes(html: string) {
  const types = new Set<string>();
  const blocks = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    for (const match of block.matchAll(/"@type"\s*:\s*(\[[^\]]*\]|"[^"]+")/g)) {
      for (const t of match[1]!.matchAll(/"([^"]+)"/g)) types.add(t[1]!);
    }
  }
  return [...types];
}

/**
 * Which AI crawlers robots.txt shuts out of the whole site. Consecutive
 * User-agent lines share the rules that follow them, as crawlers read it.
 */
export function aiBotsBlocked(robots: string) {
  const blocked = new Set<string>();
  let agents: string[] = [];
  let inRules = false;
  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const agent = line.match(/^user-agent\s*:\s*(\S+)/i)?.[1];
    if (agent) {
      if (inRules) agents = [];
      inRules = false;
      agents.push(agent.toLowerCase());
      continue;
    }
    if (!line) continue;
    inRules = true;
    if (/^disallow\s*:\s*\/\s*$/i.test(line)) {
      for (const bot of AI_BOTS) if (agents.includes(bot.toLowerCase())) blocked.add(bot);
    }
  }
  return [...blocked];
}

export function analyzeHtml(html: string, city: string | null) {
  const text = textOf(html);
  const lowerText = text.toLowerCase();
  const title = html
    .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.trim()
    .replace(/\s+/g, " ");
  const metaDescription =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1];
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map((m) => m[1]!);
  const anchors = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) =>
    textOf(m[0]).toLowerCase(),
  );
  const schemaTypes = collectSchemaTypes(html);
  const bookingLinks = [...new Set(hrefs.filter(isBookingUrl))].slice(0, 5);
  const hasBookAnchor =
    anchors.some((a) => /\b(book|booking|appointment|schedule)\b/.test(a)) ||
    hrefs.some((h) => /\/(book|booking|appointments?|schedule)\b/i.test(h));
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];

  return {
    title: title || undefined,
    metaDescription: metaDescription?.trim() || undefined,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    schemaTypes,
    hasLocalBusinessSchema: schemaTypes.some((t) =>
      /LocalBusiness|BeautySalon|HairSalon|NailSalon|DaySpa|HealthAndBeautyBusiness|MedicalSpa|Store|ProfessionalService/i.test(
        t,
      ),
    ),
    hasFaq:
      schemaTypes.includes("FAQPage") ||
      /\bfaqs?\b|frequently asked/i.test(lowerText) ||
      hrefs.some((h) => /faq/i.test(h)),
    bookingLinks,
    hasBookingLink: bookingLinks.length > 0 || hasBookAnchor,
    priceCount: (text.match(/\$\s?\d{2,4}(?:\.\d{2})?/g) ?? []).length,
    mentionsBeforeAfter: /before\s*(?:&|and|\/|\+)\s*after/i.test(lowerText),
    mentionsCity: city ? lowerText.includes(city.toLowerCase()) : null,
    hasPhoneLink: hrefs.some((h) => h.startsWith("tel:")),
    socialLinks: [
      ...new Set(
        hrefs.filter((h) =>
          /instagram\.com|tiktok\.com|facebook\.com|youtube\.com|yelp\.com|pinterest\.com/i.test(h),
        ),
      ),
    ].slice(0, 8),
    imgCount: imgs.length,
    imgMissingAlt: imgs.filter((img) => !/\balt\s*=\s*["'][^"']+["']/i.test(img)).length,
  };
}

export async function scanWebsite(raw: string, city: string | null): Promise<WebsiteScan | null> {
  const url = normalizeWebsite(raw);
  if (!url) return null;
  const base: WebsiteScan = {
    ok: false,
    url: url.toString(),
    https: url.protocol === "https:",
    hasViewport: false,
    h1Count: 0,
    schemaTypes: [],
    hasLocalBusinessSchema: false,
    hasFaq: false,
    bookingLinks: [],
    hasBookingLink: false,
    priceCount: 0,
    mentionsBeforeAfter: false,
    mentionsCity: null,
    hasPhoneLink: false,
    socialLinks: [],
    imgCount: 0,
    imgMissingAlt: 0,
    blocksAiCrawlers: [],
    hasLlmsTxt: false,
    hasSitemap: false,
  };

  let home: Awaited<ReturnType<typeof fetchText>>;
  try {
    home = await fetchText(url.toString(), 12_000);
  } catch (error) {
    return { ...base, error: error instanceof Error ? error.name : "fetch_failed" };
  }
  if (!home.response.ok) {
    return { ...base, status: home.response.status, error: `http_${home.response.status}` };
  }

  const finalUrl = new URL(home.response.url || url.toString());
  const origin = finalUrl.origin;
  const [robots, llms, sitemap] = await Promise.all(
    [`${origin}/robots.txt`, `${origin}/llms.txt`, `${origin}/sitemap.xml`].map((u) =>
      fetchText(u, 6_000, 200_000).catch(() => null),
    ),
  );
  const robotsText = robots?.response.ok ? robots.text : "";

  return {
    ...base,
    ...analyzeHtml(home.text, city),
    ok: true,
    finalUrl: finalUrl.toString(),
    https: finalUrl.protocol === "https:",
    status: home.response.status,
    ms: home.ms,
    blocksAiCrawlers: aiBotsBlocked(robotsText),
    hasLlmsTxt: Boolean(llms?.response.ok && !/<html/i.test(llms.text.slice(0, 500))),
    hasSitemap:
      /^\s*sitemap\s*:/im.test(robotsText) ||
      Boolean(sitemap?.response.ok && /<urlset|<sitemapindex/i.test(sitemap.text.slice(0, 2000))),
  };
}
