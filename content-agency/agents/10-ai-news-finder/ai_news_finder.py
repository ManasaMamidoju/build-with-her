"""
AI News Finder — Weekly Competitor Reel Scout
Scrapes top-performing content from AI & marketing creators,
presents 5 picks, and creates a Notion DigiMAIDS calendar entry.

Usage:
  python ai_news_finder.py            # interactive pick → Notion entry
  python ai_news_finder.py --preview  # show results only, no Notion write
"""

import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env", override=True)

import anthropic
from notion_client import Client as NotionClient

ANTHROPIC_API_KEY       = os.getenv("ANTHROPIC_API_KEY")
NOTION_DIGIMAIDS_KEY    = os.getenv("NOTION_DIGIMAIDS_KEY")
DIGIMAIDS_CALENDAR_DB_ID = os.getenv("NOTION_DIGIMAIDS_CALENDAR_DB_ID", "305b8948348d80999df2d1b209800cec")

CLAUDE_MODEL = "claude-sonnet-4-6"

# Competitor / inspiration accounts in AI & marketing niche
COMPETITOR_ACCOUNTS = [
    "@matthgray", "@thealexhormozi", "@garyvee", "@heyjasminestark",
    "@lara.acosta", "@thesamparr", "@lennyrachitsky", "@sweatystartup",
    "@growthhackingai", "@ai_explained_", "@peteryang.io"
]

SEARCH_QUERY_TEMPLATE = """
You are a content research assistant for DigiMAIDS, an AI-powered business assistant agency.

Search for the top-performing short-form video content (Reels, TikToks, YouTube Shorts)
from this week in the AI tools, AI business automation, and marketing niche.

Focus on creators like: {accounts}

For each of the 5 results, find content that:
- Has a strong, provocative hook (under 10 words)
- Is about AI tools, business automation, or marketing strategy
- Is performing well (high engagement, trending, or viral)
- Could inspire a DigiMAIDS talking head video

Return a JSON array of exactly 5 items:
[
  {{
    "rank": 1,
    "hook": "Short punchy hook text (under 10 words)",
    "topic": "What the video is about in 1 sentence",
    "creator": "@handle",
    "platform": "Instagram/TikTok/YouTube",
    "why_it_works": "1 sentence on why this resonated",
    "digimaids_angle": "How DigiMAIDS could put our spin on this topic"
  }}
]

Only return the JSON array. No other text.
"""


def search_trending_content() -> list[dict]:
    """Use Claude to find top 5 trending AI/marketing reels."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    accounts_str = ", ".join(COMPETITOR_ACCOUNTS[:8])
    prompt = SEARCH_QUERY_TEMPLATE.format(accounts=accounts_str)

    # Try web search first, fall back to knowledge-based if unavailable
    text = ""
    try:
        resp = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": prompt}]
        )
        for block in resp.content:
            if hasattr(block, "text"):
                text = block.text.strip()
                break
    except Exception:
        pass

    if not text:
        resp2 = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt + "\n\nNote: Use your training knowledge about trending AI/marketing content. Today's date: " + date.today().isoformat()
            }]
        )
        text = resp2.content[0].text.strip()

    # Strip code fences
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            cleaned = part.lstrip("json").strip()
            if cleaned.startswith("["):
                text = cleaned
                break

    return json.loads(text.strip())


def display_results(results: list[dict]) -> None:
    print("\n" + "="*60)
    print("TOP 5 TRENDING AI/MARKETING CONTENT THIS WEEK")
    print("="*60)
    for item in results:
        print(f"\n[{item['rank']}] {item['creator']} — {item['platform']}")
        print(f"    HOOK:    \"{item['hook']}\"")
        print(f"    TOPIC:   {item['topic']}")
        print(f"    WHY:     {item['why_it_works']}")
        print(f"    OUR SPIN: {item['digimaids_angle']}")
    print()


def pick_and_schedule(results: list[dict]) -> None:
    """Interactive pick → create Notion DigiMAIDS calendar entry."""
    while True:
        try:
            choice = int(input("Pick a number (1-5) to add to DigiMAIDS calendar, or 0 to skip: "))
            if choice == 0:
                print("Skipped. No Notion entry created.")
                return
            if 1 <= choice <= 5:
                break
            print("Enter a number between 0 and 5.")
        except ValueError:
            print("Enter a number.")

    item = results[choice - 1]

    # Default to next Tuesday (DigiMAIDS Trending AI News day)
    today = date.today()
    days_until_tuesday = (1 - today.weekday()) % 7 or 7
    post_date = today + timedelta(days=days_until_tuesday)

    print(f"\nScheduling for: {post_date.isoformat()} (Tuesday — Trending AI News slot)")

    notion = NotionClient(auth=NOTION_DIGIMAIDS_KEY)

    script_outline = f"""## Hook
{item['hook']}

## Topic
{item['topic']}

## Our Angle
{item['digimaids_angle']}

## Why It Works
{item['why_it_works']}

## Inspired By
{item['creator']} on {item['platform']}

## Script Notes
- Open with hook text on screen
- Break down the AI tool/news in 3 bullet points
- Connect to DigiMAIDS service offering
- CTA: Follow for weekly AI business breakdowns
"""

    page = notion.pages.create(
        parent={"database_id": DIGIMAIDS_CALENDAR_DB_ID},
        properties={
            "Content name": [{"text": {"content": item['hook']}}],
            "Publish date": {"date": {"start": post_date.isoformat()}},
            "Content Type": {"select": {"name": "Trending AI News"}},
            "Status": {"select": {"name": "Script Ready"}},
        },
        children=[{
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": script_outline}}]
            }
        }]
    )

    print(f"\nNotion entry created: {page['url']}")
    print(f"Title: {item['hook']}")
    print(f"Post date: {post_date.isoformat()}")


CACHE_FILE = ROOT / "content-output" / "analytics" / "ai_news_cache.json"


def run(preview=False):
    print("Searching for trending AI/marketing content...")
    results = search_trending_content()
    display_results(results)

    # Save to cache so the dashboard server can read results
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(json.dumps(results, indent=2))

    if preview:
        print("Preview mode — no Notion entry created.")
        return results

    pick_and_schedule(results)
    return results


if __name__ == "__main__":
    preview = "--preview" in sys.argv
    run(preview=preview)
