"""
Caption Writer Agent
Takes a script (or topic summary) + account + day of week.
Writes a platform-specific caption with hook line, body, CTA, and 5 hashtags.

Usage:
  python caption_writer.py --account digimaids --day Thursday --script path/to/script.md
  python caption_writer.py --account personal --day Monday --topic "I almost quit last week"
  python caption_writer.py --account bwh --day Tuesday --topic "She built a business with no funding"
"""

import argparse
import os
import re
import sys
from datetime import date
from pathlib import Path

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
SHARED = Path(__file__).parent.parent.parent / "shared-knowledge"

# CTA rules per account per day
DIGIMAIDS_CTAS = {
    "Monday":    "Get the free guide at the link in bio, or book your discovery call.",
    "Tuesday":   "Follow for weekly AI news you can actually use.",
    "Wednesday": "Want this built for your business? Free guide or discovery call. Link in bio.",
    "Thursday":  "Book your free AI audit call at the link in bio. calendly.com/mamidoju-manasa/ai-audit-call-w-digimaids",
    "Friday":    "Follow so you never miss the weekly AI recap.",
    "Saturday":  "Follow and share this with a woman building her business.",
    "Sunday":    "",
}

PERSONAL_CTAS = {
    "Monday":    "Follow for the journey.",
    "Tuesday":   "Follow for the journey.",
    "Wednesday": "Join the WhatsApp community. Free. Link in bio.",
    "Thursday":  "Tag a woman who needs to hear this.",
    "Friday":    "Follow for the journey.",
    "Saturday":  "Join the Skool community. Link in bio.",
    "Sunday":    "Follow for the journey.",
}

BWH_CTAS = {
    "Monday":    "Follow and tag a woman who needs to hear this story.",
    "Tuesday":   "Follow Build With Her for more real stories from real women.",
    "Wednesday": "Tag a woman building something right now.",
    "Thursday":  "Follow and share this. More stories every week.",
    "Friday":    "Follow Build With Her. New stories every week.",
    "Saturday":  "Follow and tag someone building her dream.",
    "Sunday":    "Follow Build With Her for more stories.",
}

# Hashtag sets per account
DIGIMAIDS_HASHTAGS = "#DigiMAIDS #AIforBusiness #BusinessAutomation #WomenEntrepreneurs #AItools"
PERSONAL_HASHTAGS = "#BuildingInPublic #WomenFounders #SolopreneurLife #EntrepreneurMindset #DigiMAIDS"
BWH_HASHTAGS = "#BuildWithHer #WomenInBusiness #WomenEntrepreneurs #RealStories #AIforWomen"

ACCOUNT_RULES = {
    "digimaids": {
        "handle": "@digimaids",
        "tone": "Confident, results-driven, direct. No fluff. Show the result. Audience is female coaches and consultants.",
        "ctas": DIGIMAIDS_CTAS,
        "hashtags": DIGIMAIDS_HASHTAGS,
        "caption_note": "Always push toward discovery call or freebie. AI clone brand — never personal.",
    },
    "personal": {
        "handle": "@manasa_mdoju",
        "tone": "Raw, real, vulnerable, audacious. Unfiltered personal voice. Women holding a 9-5 while building.",
        "ctas": PERSONAL_CTAS,
        "hashtags": PERSONAL_HASHTAGS,
        "caption_note": "Push toward community (WhatsApp or Skool) or follow. Never hard-sell services.",
    },
    "bwh": {
        "handle": "@buildwithher",
        "tone": "Media-forward, curious, warm. Amplify her story. Unbiased. Invite everyone in.",
        "ctas": BWH_CTAS,
        "hashtags": BWH_HASHTAGS,
        "caption_note": "Always push toward follow and tag someone. Never sell directly in caption.",
    },
}

BRAND_RULES = """
VOICE RULES:
- No em dashes (—). Use periods or short sentences.
- No "utilize", "leverage", "game-changer", "boss babe", "hustle harder", "crushing it",
  "empower your journey", "level up", "synergy", "disruptive", "just" (weakens authority).
- No corporate jargon. No fluff.
- Short sentences. Line breaks between ideas.
- Confident. Direct. Conversational.
- First line of caption must stand alone as a hook — this is what shows before "more".
- Maximum ONE CTA per caption.
- 5 hashtags at the end, on their own line.
"""


def load_script(script_path: str) -> str:
    path = Path(script_path)
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def write_caption(
    account: str,
    day_of_week: str,
    topic: str = "",
    script_content: str = "",
) -> dict:
    rules = ACCOUNT_RULES[account]
    cta = rules["ctas"].get(day_of_week, "Follow for more.")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    source = f"SCRIPT:\n{script_content}" if script_content else f"TOPIC: {topic}"

    prompt = f"""You are writing an Instagram/TikTok caption for Manasa Maddoju.

{BRAND_RULES}

ACCOUNT: {rules['handle']}
DAY: {day_of_week}
TONE: {rules['tone']}
CAPTION NOTE: {rules['caption_note']}
CTA FOR TODAY: {cta}
HASHTAGS TO USE: {rules['hashtags']}

{source}

Write the caption now using this exact structure:

[HOOK LINE]
(This is what shows before "more" — make it impossible to scroll past. 1 sentence max.)

[BODY]
(2-4 short paragraphs. Each idea on its own line. No walls of text.)

[CTA]
(Exactly: {cta})

[HASHTAGS]
(Exactly: {rules['hashtags']})

---
Do not add labels like "[HOOK LINE]" in the output. Just write the caption cleanly.
Separate sections with a blank line.
Total caption should be under 150 words (not counting hashtags).
"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )

    caption_text = message.content[0].text.strip()

    return {
        "account": account,
        "day_of_week": day_of_week,
        "topic": topic,
        "cta": cta,
        "caption": caption_text,
        "generated_date": date.today().isoformat(),
    }


def save_caption(result: dict, linked_script_path: str = "") -> Path:
    output_dir = Path(__file__).parent.parent.parent / "content-output" / "reels"
    output_dir.mkdir(parents=True, exist_ok=True)

    slug = re.sub(r"[^a-z0-9]+", "-", result["topic"].lower())[:50] if result["topic"] else "caption"
    filename = f"{result['generated_date']}_{result['account']}_{slug}_caption.md"
    path = output_dir / filename

    content = f"""# Caption: {result['topic'] or 'Untitled'}

**Account:** {result['account']}
**Day:** {result['day_of_week']}
**Generated:** {result['generated_date']}
{f"**Script:** {linked_script_path}" if linked_script_path else ""}

---

{result['caption']}
"""
    path.write_text(content, encoding="utf-8")
    return path


def main():
    parser = argparse.ArgumentParser(description="Write a caption for Manasa's accounts")
    parser.add_argument("--account", choices=["digimaids", "personal", "bwh"], required=True)
    parser.add_argument("--day", type=str, required=True,
                        help="Day of week (Monday-Sunday)")
    parser.add_argument("--topic", type=str, default="",
                        help="Topic or subject of the content")
    parser.add_argument("--script", type=str, default="",
                        help="Path to a script .md file to base the caption on")
    args = parser.parse_args()

    script_content = ""
    if args.script:
        script_content = load_script(args.script)
        if not script_content:
            print(f"[Caption Writer] Could not read script: {args.script}")
            sys.exit(1)

    topic = args.topic
    if not topic and script_content:
        # Try to extract topic from script file name
        topic = Path(args.script).stem.replace("-", " ").replace("_", " ")

    if not topic and not script_content:
        print("[Caption Writer] Provide --topic or --script.")
        sys.exit(1)

    print(f"[Caption Writer] Writing {args.account} caption for {args.day}: {topic or '(from script)'}")
    result = write_caption(args.account, args.day, topic, script_content)

    path = save_caption(result, args.script)
    print(f"[Caption Writer] Caption saved to: {path}")
    print()
    print(result["caption"])

    return result


if __name__ == "__main__":
    main()
