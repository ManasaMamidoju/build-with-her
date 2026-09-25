/**
 * Social and Google Business Profile data through Apify actors.
 * Every call is optional: no token, a timeout or an odd response just means
 * that part of the scan is marked "could not check", never a failed score.
 *
 * Field names follow each actor's documented output; everything is read
 * defensively because actors change their output over time.
 */

type Json = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

async function runActor(actor: string, input: Json, timeoutSecs = 75): Promise<Json[] | null> {
  const token = process.env["APIFY_TOKEN"];
  if (!token) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeoutSecs + 10) * 1000);
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=${timeoutSecs}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      console.error(`apify ${actor} failed [${response.status}]`);
      return null;
    }
    const items = (await response.json()) as unknown;
    return Array.isArray(items) ? (items as Json[]) : null;
  } catch (error) {
    console.error(`apify ${actor} failed`, error instanceof Error ? error.name : error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** "@glow.studio", "instagram.com/glow.studio/", "https://www.tiktok.com/@glow" -> "glow.studio" */
export function handleFrom(raw: string, host: "instagram" | "tiktok"): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const fromUrl = trimmed.match(new RegExp(`${host}\\.com\\/@?([A-Za-z0-9._]+)`, "i"))?.[1];
  const handle = (fromUrl ?? trimmed).replace(/^@/, "").replace(/\/+$/, "");
  return /^[A-Za-z0-9._]{1,40}$/.test(handle) ? handle : null;
}

export function facebookUrlFrom(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const path = trimmed.match(/facebook\.com\/(.+)$/i)?.[1] ?? trimmed.replace(/^@/, "");
  const clean = path.split(/[?#]/)[0]!.replace(/\/+$/, "");
  return /^[A-Za-z0-9.\-_/=]{2,120}$/.test(clean) ? `https://www.facebook.com/${clean}` : null;
}

const daysSince = (iso: string | null) =>
  iso ? (Date.now() - new Date(iso).getTime()) / 86_400_000 : null;

export type InstagramScan = {
  found: boolean;
  username: string;
  followers: number | null;
  posts: number | null;
  bio: string | null;
  link: string | null;
  category: string | null;
  daysSinceLastPost: number | null;
  captionsMentionBeforeAfter: boolean;
};

export async function scanInstagram(raw: string): Promise<InstagramScan | null> {
  const username = handleFrom(raw, "instagram");
  if (!username) return null;
  const items = await runActor("apify~instagram-profile-scraper", { usernames: [username] });
  if (!items) return null;
  const p = items.find((i) => str(i["username"])?.toLowerCase() === username.toLowerCase());
  if (!p) {
    return {
      found: false,
      username,
      followers: null,
      posts: null,
      bio: null,
      link: null,
      category: null,
      daysSinceLastPost: null,
      captionsMentionBeforeAfter: false,
    };
  }
  const posts = Array.isArray(p["latestPosts"]) ? (p["latestPosts"] as Json[]) : [];
  const newest = posts
    .map((post) => str(post["timestamp"]))
    .filter((t): t is string => Boolean(t))
    .sort()
    .pop();
  return {
    found: true,
    username,
    followers: num(p["followersCount"]),
    posts: num(p["postsCount"]),
    bio: str(p["biography"]),
    link: str(p["externalUrl"]),
    category: str(p["businessCategoryName"]),
    daysSinceLastPost: daysSince(newest ?? null),
    captionsMentionBeforeAfter: posts.some((post) =>
      /before\s*(?:&|and|\/|\+)\s*after/i.test(str(post["caption"]) ?? ""),
    ),
  };
}

export type TikTokScan = {
  found: boolean;
  username: string;
  followers: number | null;
  bio: string | null;
  link: string | null;
  daysSinceLastPost: number | null;
};

export async function scanTikTok(raw: string): Promise<TikTokScan | null> {
  const username = handleFrom(raw, "tiktok");
  if (!username) return null;
  const items = await runActor("clockworks~tiktok-profile-scraper", {
    profiles: [username],
    resultsPerPage: 5,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  });
  if (!items) return null;
  const withAuthor = items.filter((i) => typeof i["authorMeta"] === "object" && i["authorMeta"]);
  if (!withAuthor.length) {
    return {
      found: false,
      username,
      followers: null,
      bio: null,
      link: null,
      daysSinceLastPost: null,
    };
  }
  const author = withAuthor[0]!["authorMeta"] as Json;
  const newest = withAuthor
    .map((v) => str(v["createTimeISO"]))
    .filter((t): t is string => Boolean(t))
    .sort()
    .pop();
  return {
    found: true,
    username,
    followers: num(author["fans"]),
    bio: str(author["signature"]),
    link: str(author["bioLink"]),
    daysSinceLastPost: daysSince(newest ?? null),
  };
}

export type FacebookScan = {
  found: boolean;
  url: string;
  followers: number | null;
  website: string | null;
  intro: string | null;
};

export async function scanFacebook(raw: string): Promise<FacebookScan | null> {
  const url = facebookUrlFrom(raw);
  if (!url) return null;
  const items = await runActor("apify~facebook-pages-scraper", { startUrls: [{ url }] });
  if (!items) return null;
  const p = items[0];
  if (!p || str(p["error"])) {
    return { found: false, url, followers: null, website: null, intro: null };
  }
  const websites = Array.isArray(p["websites"]) ? (p["websites"] as unknown[]) : [];
  return {
    found: true,
    url,
    followers: num(p["followers"]) ?? num(p["likes"]),
    website: str(p["website"]) ?? str(websites[0]),
    intro: str(p["intro"]),
  };
}

export type GoogleScan = {
  found: boolean;
  query: string;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  photos: number | null;
  hasHours: boolean;
  unclaimed: boolean;
  mapsUrl: string | null;
};

/** Google Business Profile via Google Maps: the first result for "business name + city". */
export async function scanGoogle(
  businessName: string,
  city: string | null,
): Promise<GoogleScan | null> {
  const query = [businessName, city].filter(Boolean).join(" ");
  const items = await runActor("compass~crawler-google-places", {
    searchStringsArray: [query],
    maxCrawledPlacesPerSearch: 1,
    language: "en",
    skipClosedPlaces: false,
  });
  if (!items) return null;
  const p = items[0];
  const empty: GoogleScan = {
    found: false,
    query,
    name: null,
    category: null,
    city: null,
    address: null,
    website: null,
    rating: null,
    reviews: null,
    photos: null,
    hasHours: false,
    unclaimed: false,
    mapsUrl: null,
  };
  if (!p) return empty;
  const name = str(p["title"]);
  // Maps always returns something; only trust it if the name actually matches hers.
  const words = businessName
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  const matches = name ? words.some((w) => name.toLowerCase().includes(w)) : false;
  if (!matches) return empty;
  return {
    found: true,
    query,
    name,
    category: str(p["categoryName"]),
    city: str(p["city"]),
    address: str(p["address"]),
    website: str(p["website"]),
    rating: num(p["totalScore"]),
    reviews: num(p["reviewsCount"]),
    photos: num(p["imagesCount"]),
    hasHours: Array.isArray(p["openingHours"]) && (p["openingHours"] as unknown[]).length > 0,
    unclaimed: p["claimThisBusiness"] === true,
    mapsUrl: str(p["url"]),
  };
}
