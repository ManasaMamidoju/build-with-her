"""
Script Writer Agent
Takes a topic/trend and writes a complete 45-60 second script.

Two modes:
  - digimaids: AI clone script for @digimaids (no talking head, AI clone video)
  - personal:  Talking head script for @manasa_mdoju

Usage:
  python script_writer.py --account digimaids --topic "AI content automation for coaches"
  python script_writer.py --account personal --topic "What I wish I knew before quitting my 9-5"
  python script_writer.py --account digimaids --trend-file trend_output.json --rank 1
"""

import argparse
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

SHARED = Path(__file__).parent.parent.parent / "shared-knowledge"

BRAND_RULES = """
MANASA'S VOICE RULES (non-negotiable):
- No em dashes (—). Use periods or line breaks instead.
- No "utilize", "leverage", "game-changer", "boss babe", "hustle harder", "crushing it",
  "empower your journey", "level up your business", "synergy", "disruptive",
  "passionate about helping", "just" (weakens authority).
- No corporate jargon. No fluff.
- Write how she talks — direct, punchy, real, warm.
- Short sentences. Never a wall of text.
- Confident tone. She doesn't beg or over-justify.
- Conversational — like talking to a friend, not an audience.
- Maximum ONE CTA per script, in the final 5 seconds only.
"""

DIGIMAIDS_RULES = """
DIGIMAIDS-SPECIFIC RULES:
- This is an AI CLONE video. Manasa does NOT appear on screen. Her AI clone does.
- Never write stage directions like "look at camera" or "gesture" — the clone can't do those.
- Tone: Confident, results-driven, direct. Show the system. Show the results.
- Audience: Maya, a 28-42 female coach or consultant earning $40K-$120K who wants to scale.
- Always connect the content to AI automation for service-based women business owners.
- CTAs rotate by day (see below). Use the CTA matching the day_of_week passed in.

CTA by day:
  Monday:    "Get the free guide at the link in bio, or book a discovery call."
  Tuesday:   "Follow for more AI updates every week."
  Wednesday: "Get the free guide or book a discovery call. Link in bio."
  Thursday:  "Book your free AI audit call at the link in bio." (STRONGEST CTA — this is the closer)
  Friday:    "Follow so you never miss the weekly AI recap."
  Saturday:  "Follow and share this with a woman building her business."

Format:
[HOOK] — first 3-5 seconds. Stops the scroll. A bold claim, question, or fact.
[VALUE] — 35-45 seconds of the actual content.
[CTA] — final 5 seconds. One action.

Include time markers like (0:00-0:05) (0:05-0:50) (0:50-1:00).
Total target: 45-60 seconds of spoken content.
"""

PERSONAL_RULES = """
PERSONAL BRAND (@manasa_mdoju) RULES:
- This is a TALKING HEAD video. Manasa speaks directly to camera.
- Tone: Raw, real, vulnerable, audacious. Unfiltered.
- Audience: Women building something while holding a 9-5, curious about AI and entrepreneurship.
- Content types: building in public, failure/lesson, process/framework, viral format, day in the life.
- CTA options (pick the right one for the topic):
    "Follow for the journey."
    "Join the WhatsApp community — free. Link in bio."
    "Join the Skool community. Link in bio."
    "Tag a woman who needs to hear this."

Format:
[HOOK] — first 3-5 seconds. Personal, raw, makes her feel seen.
[VALUE] — 30-50 seconds of honest story or insight.
[CTA] — final 5 seconds.

Include time markers. Total target: 45-60 seconds.
"""


def load_shared_knowledge() -> str:
    files = ["PERSONAL_BRAND_GUIDE.md", "CONTENT_RULES.md", "OFFERS_AND_FUNNELS.md"]
    content = ""
    for f in files:
        path = SHARED / f
        if path.exists():
            content += f"\n\n---\n# {f}\n" + path.read_text(encoding="utf-8")
    return content


def write_script(
    topic: str,
    account: str,
    day_of_week: str = "Tuesday",
    extra_context: str = "",
) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    shared = load_shared_knowledge()

    account_rules = DIGIMAIDS_RULES if account == "digimaids" else PERSONAL_RULES

    prompt = f"""You are writing a social media video script for Manasa Maddoju.

{BRAND_RULES}

{account_rules}

SHARED BRAND KNOWLEDGE:
{shared}

TODAY: {date.today().isoformat()}
DAY OF WEEK: {day_of_week}
ACCOUNT: @{"digimaids" if account == "digimaids" else "manasa_mdoju"}
TOPIC: {topic}
{f"EXTRA CONTEXT: {extra_context}" if extra_context else ""}

Write the complete script now. Use this exact structure:

ACCOUNT: @{"digimaids" if account == "digimaids" else "manasa_mdoju"}
TOPIC: [restate the topic clearly]
DAY: {day_of_week}
ESTIMATED DURATION: [X seconds]

---

[HOOK] (0:00-0:05)
[write the hook here — 1-2 punchy sentences max]

[VALUE] (0:05-0:50)
[write the full value section here — use short paragraphs, each spoken line on its own line]

[CTA] (0:50-1:00)
[write the CTA here — one sentence, direct]

---

NOTES FOR EDITOR:
[2-3 bullet points — key visual suggestions, pacing notes, or b-roll ideas if applicable]
"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    script_text = message.content[0].text.strip()

    # Parse estimated duration
    duration_match = re.search(r"ESTIMATED DURATION:\s*(\d+)\s*seconds?", script_text)
    estimated_seconds = int(duration_match.group(1)) if duration_match else 0

    return {
        "account": account,
        "topic": topic,
        "day_of_week": day_of_week,
        "estimated_seconds": estimated_seconds,
        "script": script_text,
        "generated_date": date.today().isoformat(),
    }


def save_script(result: dict) -> Path:
    output_dir = (
        Path(__file__).parent.parent.parent
        / "content-output"
        / ("reels" if result["account"] == "digimaids" else "reels")
    )
    output_dir.mkdir(parents=True, exist_ok=True)

    slug = re.sub(r"[^a-z0-9]+", "-", result["topic"].lower())[:50]
    filename = f"{result['generated_date']}_{result['account']}_{slug}.md"
    path = output_dir / filename

    content = f"""# Script: {result['topic']}

**Account:** @{result['account']}
**Day:** {result['day_of_week']}
**Estimated Duration:** {result['estimated_seconds']}s
**Generated:** {result['generated_date']}

---

{result['script']}
"""
    path.write_text(content, encoding="utf-8")
    return path


def main():
    parser = argparse.ArgumentParser(description="Write a video script for Manasa")
    parser.add_argument("--account", choices=["digimaids", "personal"], required=True)
    parser.add_argument("--topic", type=str, default="")
    parser.add_argument("--day", type=str, default="Tuesday",
                        help="Day of week (Monday-Saturday)")
    parser.add_argument("--trend-file", type=str, default="",
                        help="Path to trend_scout JSON output")
    parser.add_argument("--rank", type=int, default=1,
                        help="Which trend rank to use from trend file (1-5)")
    parser.add_argument("--context", type=str, default="",
                        help="Extra context or notes for the script")
    args = parser.parse_args()

    topic = args.topic
    extra_context = args.context

    if args.trend_file:
        trend_path = Path(args.trend_file)
        if not trend_path.exists():
            print(f"[Script Writer] Trend file not found: {trend_path}")
            sys.exit(1)
        trends = json.loads(trend_path.read_text())
        match = next((t for t in trends if t.get("rank") == args.rank), None)
        if not match:
            print(f"[Script Writer] Trend rank {args.rank} not found in file.")
            sys.exit(1)
        topic = match.get("trend_summary", topic)
        extra_context = (
            f"Hook suggestion from Trend Scout: {match.get('hook_copy', '')}\n"
            f"Suggested angle: {match.get('suggested_angle', '')}"
        )

    if not topic:
        print("[Script Writer] --topic is required unless using --trend-file.")
        sys.exit(1)

    print(f"[Script Writer] Writing {args.account} script for: {topic}")
    result = write_script(topic, args.account, args.day, extra_context)

    path = save_script(result)
    print(f"[Script Writer] Script saved to: {path}")
    print()
    print(result["script"])

    return result


if __name__ == "__main__":
    main()
