"""
Trend Scout Agent
Runs daily. Scrapes Instagram, TikTok, and YouTube for trending AI content
in the coaching/women entrepreneur space. Returns top 5 trends with outlier
scores and suggested angles, then saves to Notion DigiMAIDS content calendar.
"""

import os
import json
import re
from datetime import date, datetime
from apify_client import ApifyClient
import anthropic
from notion_client import Client as NotionClient

APIFY_TOKEN = os.environ["APIFY_TOKEN"]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
NOTION_KEY = os.environ["NOTION_DIGIMAIDS_KEY"]

# Notion database ID for DigiMAIDS content calendar
# Set this once after creating the database in Notion
NOTION_CALENDAR_DB_ID = os.environ.get("NOTION_DIGIMAIDS_CALENDAR_DB_ID", "")

SEARCH_QUERIES = [
    "AI for coaches",
    "AI content automation",
    "AI for women entrepreneurs",
    "AI automation for coaches 2026",
]

# Only flag creators in this follower range as strong signal
SMALL_CREATOR_MIN = 10_000
SMALL_CREATOR_MAX = 100_000


def scrape_tiktok(client: ApifyClient, query: str) -> list[dict]:
    run = client.actor("clockworks/free-tiktok-scraper").call(
        run_input={
            "searchQueries": [query],
            "maxResultsPerQuery": 20,
            "shouldDownloadVideos": False,
            "shouldDownloadCovers": False,
        }
    )
    results = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        results.append({
            "platform": "TikTok",
            "query": query,
            "id": item.get("id", ""),
            "url": item.get("webVideoUrl", ""),
            "description": item.get("text", ""),
            "views": item.get("playCount", 0),
            "likes": item.get("diggCount", 0),
            "author": item.get("authorMeta", {}).get("name", ""),
            "author_followers": item.get("authorMeta", {}).get("fans", 0),
            "created_at": item.get("createTimeISO", ""),
        })
    return results


def scrape_instagram(client: ApifyClient, query: str) -> list[dict]:
    run = client.actor("apify/instagram-hashtag-scraper").call(
        run_input={
            "hashtags": [query.replace(" ", "")],
            "resultsLimit": 20,
        }
    )
    results = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        results.append({
            "platform": "Instagram",
            "query": query,
            "id": item.get("id", ""),
            "url": item.get("url", ""),
            "description": item.get("caption", ""),
            "views": item.get("videoViewCount", item.get("likesCount", 0)),
            "likes": item.get("likesCount", 0),
            "author": item.get("ownerUsername", ""),
            "author_followers": item.get("ownerFollowersCount", 0),
            "created_at": item.get("timestamp", ""),
        })
    return results


def scrape_youtube(client: ApifyClient, query: str) -> list[dict]:
    run = client.actor("streamers/youtube-scraper").call(
        run_input={
            "searchKeywords": query,
            "maxResults": 20,
            "uploadDateFilter": "month",
        }
    )
    results = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        results.append({
            "platform": "YouTube",
            "query": query,
            "id": item.get("id", ""),
            "url": item.get("url", ""),
            "description": item.get("title", "") + " " + item.get("description", ""),
            "views": item.get("viewCount", 0),
            "likes": item.get("likes", 0),
            "author": item.get("channelName", ""),
            "author_followers": item.get("channelSubscriberCount", 0),
            "created_at": item.get("publishedAt", ""),
        })
    return results


def compute_outlier_score(item: dict) -> float:
    """
    Simple outlier score: views divided by a baseline expectation derived
    from follower count. Higher = more viral relative to channel size.
    Small creators (10K-100K) are weighted higher.
    """
    followers = item.get("author_followers", 1) or 1
    views = item.get("views", 0) or 0
    ratio = views / followers

    # Boost small creators
    if SMALL_CREATOR_MIN <= followers <= SMALL_CREATOR_MAX:
        ratio *= 2.0

    return round(ratio, 4)


def analyze_trends_with_claude(items: list[dict]) -> list[dict]:
    """
    Send top candidates to Claude for hook copy + suggested angle for Manasa.
    Returns top 5 trends enriched with hook_copy and suggested_angle fields.
    """
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Sort by outlier score, take top 15 for Claude to reason over
    candidates = sorted(items, key=lambda x: x["outlier_score"], reverse=True)[:15]

    prompt = f"""You are analyzing trending social media content about AI for coaches and women entrepreneurs.
Here are the top {len(candidates)} trending posts by outlier score (views relative to channel size):

{json.dumps(candidates, indent=2, default=str)}

Today is {date.today().isoformat()}.

Return ONLY a JSON array of the top 5 most actionable trends for a DigiMAIDS content creator
(AI automation agency for women coaches). For each trend include:
- rank (1-5)
- platform
- url
- author
- outlier_score
- trend_summary (1 sentence — what the trend is about)
- hook_copy (punchy 1-sentence hook Manasa could use, her voice: direct, no em dashes, no corporate jargon)
- suggested_angle (how Manasa should approach this topic for @digimaids — connect it to AI clone or automation results)
- day_of_week_fit (which day of the week content schedule this fits best: Monday/Tuesday/Wednesday/Thursday/Friday/Saturday)

Return ONLY valid JSON, no markdown fences."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    # Strip markdown fences if Claude adds them anyway
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    return json.loads(raw)


def save_to_notion(trends: list[dict]) -> None:
    if not NOTION_CALENDAR_DB_ID:
        print("[Trend Scout] NOTION_DIGIMAIDS_CALENDAR_DB_ID not set — skipping Notion save.")
        return

    notion = NotionClient(auth=NOTION_KEY)
    today = date.today().isoformat()

    for trend in trends:
        notion.pages.create(
            parent={"database_id": NOTION_CALENDAR_DB_ID},
            properties={
                "Name": {"title": [{"text": {"content": f"[Trend #{trend['rank']}] {trend['trend_summary']}"}}]},
                "Platform": {"select": {"name": trend.get("platform", "TikTok")}},
                "Outlier Score": {"number": trend.get("outlier_score", 0)},
                "Hook Copy": {"rich_text": [{"text": {"content": trend.get("hook_copy", "")}}]},
                "Suggested Angle": {"rich_text": [{"text": {"content": trend.get("suggested_angle", "")}}]},
                "Day Fit": {"select": {"name": trend.get("day_of_week_fit", "Tuesday")}},
                "Source URL": {"url": trend.get("url", "")},
                "Scouted Date": {"date": {"start": today}},
                "Status": {"select": {"name": "Trend Idea"}},
            },
        )
        print(f"[Trend Scout] Saved trend #{trend['rank']} to Notion.")


def run() -> list[dict]:
    apify = ApifyClient(APIFY_TOKEN)
    all_items: list[dict] = []

    for query in SEARCH_QUERIES:
        print(f"[Trend Scout] Scraping TikTok: {query}")
        try:
            all_items.extend(scrape_tiktok(apify, query))
        except Exception as e:
            print(f"[Trend Scout] TikTok error ({query}): {e}")

        print(f"[Trend Scout] Scraping Instagram: {query}")
        try:
            all_items.extend(scrape_instagram(apify, query))
        except Exception as e:
            print(f"[Trend Scout] Instagram error ({query}): {e}")

        print(f"[Trend Scout] Scraping YouTube: {query}")
        try:
            all_items.extend(scrape_youtube(apify, query))
        except Exception as e:
            print(f"[Trend Scout] YouTube error ({query}): {e}")

    # Deduplicate by URL
    seen = set()
    unique_items = []
    for item in all_items:
        if item["url"] not in seen:
            seen.add(item["url"])
            item["outlier_score"] = compute_outlier_score(item)
            unique_items.append(item)

    print(f"[Trend Scout] {len(unique_items)} unique posts collected. Analyzing with Claude...")
    top_trends = analyze_trends_with_claude(unique_items)

    print("[Trend Scout] Top 5 trends:")
    for t in top_trends:
        print(f"  #{t['rank']} [{t['platform']}] Score: {t['outlier_score']} — {t['trend_summary']}")
        print(f"    Hook: {t['hook_copy']}")
        print(f"    Angle: {t['suggested_angle']}")
        print(f"    Best day: {t['day_of_week_fit']}")
        print()

    save_to_notion(top_trends)
    return top_trends


if __name__ == "__main__":
    run()
