"""
Weekly Debrief Agent
Runs every Sunday at 7pm via n8n cron.

Pulls movement metrics from Notion, generates new content ideas with Claude,
creates a Notion debrief page, and emails a summary brief.

Usage:
  python weekly_debrief.py
  python weekly_debrief.py --dry-run   # preview without creating/sending
"""

import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

import anthropic
from notion_client import Client as NotionClient

ANTHROPIC_API_KEY          = os.getenv("ANTHROPIC_API_KEY")
NOTION_PERSONAL_KEY        = os.getenv("NOTION_PERSONAL_KEY")
NOTION_DIGIMAIDS_KEY       = os.getenv("NOTION_DIGIMAIDS_KEY")
BWH_INTERVIEWS_DB_ID       = os.getenv("BWH_INTERVIEWS_DB_ID", "e7d8155bee154b2fa685ccd46cc87f2f")
PERSONAL_CALENDAR_DB_ID    = os.getenv("NOTION_PERSONAL_CALENDAR_DB_ID", "")
DIGIMAIDS_CALENDAR_DB_ID   = os.getenv("NOTION_DIGIMAIDS_CALENDAR_DB_ID", "305b8948348d80999df2d1b209800cec")
DEBRIEF_PARENT_PAGE_ID     = os.getenv("NOTION_DEBRIEF_PARENT_PAGE_ID", "1172c60b0a6f80308d4cf0b724cb2b08")

GMAIL_SENDER    = os.getenv("GMAIL_SENDER", "mamidoju.manasa@gmail.com")
GMAIL_APP_PW    = os.getenv("GMAIL_APP_PASSWORD", "")
GMAIL_RECIPIENT = os.getenv("GMAIL_RECIPIENT", "mamidoju.manasa@gmail.com")

CLAUDE_MODEL = "claude-sonnet-4-6"

# ── NOTION HELPERS ─────────────────────────────────────────────────────────

def query_db(client, db_id, filter_obj=None):
    kwargs = {"database_id": db_id}
    if filter_obj:
        kwargs["filter"] = filter_obj
    results = []
    while True:
        resp = client.databases.query(**kwargs)
        results.extend(resp.get("results", []))
        if not resp.get("has_more"):
            break
        kwargs["start_cursor"] = resp["next_cursor"]
    return results


def get_plain_text(prop):
    if not prop:
        return ""
    if prop.get("type") == "title":
        return "".join(t.get("plain_text", "") for t in prop.get("title", []))
    if prop.get("type") == "rich_text":
        return "".join(t.get("plain_text", "") for t in prop.get("rich_text", []))
    if prop.get("type") == "select":
        return (prop.get("select") or {}).get("name", "")
    return ""


def get_date(prop):
    if not prop:
        return ""
    return (prop.get("date") or {}).get("start", "")


# ── METRICS ───────────────────────────────────────────────────────────────

def collect_metrics():
    personal = NotionClient(auth=NOTION_PERSONAL_KEY)
    digimaids = NotionClient(auth=NOTION_DIGIMAIDS_KEY)

    # BWH interviews
    all_interviews = query_db(personal, BWH_INTERVIEWS_DB_ID)
    total_interviewed = len([
        p for p in all_interviews
        if get_plain_text(p["properties"].get("Overall Status")) in
           ("Interviewed", "Start Editing", "Editing", "Ready for Review", "Ready to Post", "Posted", "Archived")
    ])
    total_posted = len([
        p for p in all_interviews
        if get_plain_text(p["properties"].get("Overall Status")) == "Posted"
    ])
    ready_to_post = len([
        p for p in all_interviews
        if get_plain_text(p["properties"].get("Overall Status")) == "Ready to Post"
    ])

    # DigiMAIDS calendar — posts this week
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    digi_this_week = 0
    if DIGIMAIDS_CALENDAR_DB_ID:
        digi_entries = query_db(digimaids, DIGIMAIDS_CALENDAR_DB_ID, {
            "and": [
                {"property": "Publish date", "date": {"on_or_after": week_start.isoformat()}},
                {"property": "Publish date", "date": {"on_or_before": week_end.isoformat()}},
            ]
        })
        digi_this_week = len(digi_entries)

    # Personal calendar — ready to post
    personal_ready = 0
    if PERSONAL_CALENDAR_DB_ID:
        try:
            personal_entries = query_db(digimaids, PERSONAL_CALENDAR_DB_ID)
            personal_ready = len([
                p for p in personal_entries
                if get_plain_text(p["properties"].get("Status")) in ("Ready to Post", "In progress", "Done")
            ])
        except Exception:
            pass

    return {
        "women_interviewed": total_interviewed,
        "women_posted": total_posted,
        "ready_to_post_interviews": ready_to_post,
        "digi_posts_this_week": digi_this_week,
        "personal_videos_ready": personal_ready,
        "week_of": week_start.isoformat(),
    }


# ── CONTENT IDEA GENERATION ───────────────────────────────────────────────

def generate_debrief(metrics: dict) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    today = date.today()
    week_of = metrics.get("week_of", today.isoformat())

    prompt = f"""You are the content strategist for Manasa Mamidoju's Build With Her movement and @manasa_mdoju personal brand.

TODAY: {today.isoformat()}
WEEK OF: {week_of}

MOVEMENT METRICS THIS WEEK:
- Women interviewed (total): {metrics['women_interviewed']}
- Women stories posted: {metrics['women_posted']}
- Interviews ready to post: {metrics['ready_to_post_interviews']}
- DigiMAIDS posts scheduled this week: {metrics['digi_posts_this_week']}
- Personal videos ready: {metrics['personal_videos_ready']}

ABOUT THE MOVEMENT:
Build With Her (BWH) documents women building businesses. Manasa advocates for ethical AI use — AI as education and empowerment, not replacement. She's building in public, showing the real process of building DigiMAIDS from scratch.

HER PERSONAL BRAND (@manasa_mdoju) pillars:
- Building in Public (transparency about agency journey)
- Framework / Process (how-to, step by step)
- Viral Format (POV, before/after, reactions)
- What Didn't Work (honest failures)
- Day in the Life
- Ethical AI (advocating for AI education, not fear)

YOUR TASK — Generate a weekly debrief with:

1. WEEK IN REVIEW (2-3 sentences on movement progress)
2. 6 TALKING HEAD VIDEO IDEAS for next week (personal brand)
   - Each must have: a punchy HOOK (under 10 words, bold statement), 4 TALKING POINTS (one phrase each), and a CTA
   - Mix content types: 2x Building in Public, 1x Ethical AI, 1x Viral Format, 1x Framework, 1x What Didn't Work
   - Hook style: think @matthgray — short, declarative, slightly provocative. Examples: "I replaced my $180K CMO with AI", "Why tools beat lead magnets", "I actually don't like systems"
3. MOVEMENT INSIGHT (1-2 sentences: what pattern are you seeing across the women you interview?)
4. NEXT WEEK PRIORITY (1 action that would move the needle most)

Return as JSON with this structure:
{{
  "week_in_review": "...",
  "video_ideas": [
    {{
      "hook": "...",
      "content_type": "Building in Public",
      "talking_points": ["...", "...", "...", "..."],
      "cta": "..."
    }}
  ],
  "movement_insight": "...",
  "next_week_priority": "..."
}}"""

    resp = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = resp.content[0].text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


# ── NOTION PAGE CREATION ──────────────────────────────────────────────────

def create_debrief_page(metrics: dict, debrief: dict) -> str:
    client = NotionClient(auth=NOTION_PERSONAL_KEY)
    today = date.today()

    video_blocks = []
    for i, v in enumerate(debrief.get("video_ideas", []), 1):
        points = "\n".join(f"{j}. {pt}" for j, pt in enumerate(v.get("talking_points", []), 1))
        video_blocks.append(f"""---

### Video {i} — {v['content_type']}

# {v['hook']}

{points}

**CTA:** {v.get('cta', '')}
""")

    content = f"""## Week of {metrics['week_of']}

---

## Movement Stats
| Metric | Count |
|--------|-------|
| Women Interviewed | {metrics['women_interviewed']} |
| Women Stories Posted | {metrics['women_posted']} |
| Ready to Post | {metrics['ready_to_post_interviews']} |
| DigiMAIDS Posts This Week | {metrics['digi_posts_this_week']} |

---

## Week in Review
{debrief['week_in_review']}

---

## Movement Insight
{debrief['movement_insight']}

---

## Next Week Priority
> {debrief['next_week_priority']}

---

## 6 Video Ideas for Next Week

{''.join(video_blocks)}

---

## Notes

"""

    resp = client.pages.create(
        parent={"page_id": DEBRIEF_PARENT_PAGE_ID},
        properties={
            "title": [{"text": {"content": f"Weekly Debrief — {today.strftime('%b %d, %Y')}"}}]
        },
        children=[
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": content}}]
                }
            }
        ]
    )
    return resp["url"]


# ── EMAIL ─────────────────────────────────────────────────────────────────

def send_email_brief(metrics: dict, debrief: dict, notion_url: str):
    import smtplib
    from email.mime.text import MIMEText

    today = date.today()
    subject = f"Weekly Debrief — {today.strftime('%b %d, %Y')} | Build With Her"

    video_lines = []
    for i, v in enumerate(debrief.get("video_ideas", []), 1):
        pts = "\n   ".join(f"{j}. {p}" for j, p in enumerate(v.get("talking_points", []), 1))
        video_lines.append(
            f"VIDEO {i} [{v['content_type'].upper()}]\n"
            f"Hook: {v['hook']}\n"
            f"   {pts}\n"
            f"CTA: {v.get('cta','')}"
        )

    body = f"""WEEKLY DEBRIEF — {today.strftime('%B %d, %Y')}
Build With Her Movement + @manasa_mdoju

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOVEMENT STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Women Interviewed:    {metrics['women_interviewed']}
Women Stories Posted: {metrics['women_posted']}
Ready to Post:        {metrics['ready_to_post_interviews']}
DigiMAIDS This Week:  {metrics['digi_posts_this_week']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEEK IN REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{debrief['week_in_review']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOVEMENT INSIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{debrief['movement_insight']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT WEEK PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{debrief['next_week_priority']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6 VIDEO IDEAS — BATCH THESE SUNDAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{chr(10).join(chr(10).join(['', v]) for v in video_lines)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full debrief in Notion: {notion_url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = GMAIL_SENDER
    msg["To"] = GMAIL_RECIPIENT

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_SENDER, GMAIL_APP_PW)
        server.sendmail(GMAIL_SENDER, [GMAIL_RECIPIENT], msg.as_string())

    print(f"Email sent to {GMAIL_RECIPIENT}")


# ── MAIN ──────────────────────────────────────────────────────────────────

def run(dry_run=False):
    print("=== Weekly Debrief ===")

    print("[1/4] Collecting metrics from Notion...")
    metrics = collect_metrics()
    print(f"  Women interviewed: {metrics['women_interviewed']}")
    print(f"  Women posted:      {metrics['women_posted']}")
    print(f"  Ready to post:     {metrics['ready_to_post_interviews']}")

    print("[2/4] Generating debrief with Claude...")
    debrief = generate_debrief(metrics)
    print(f"  Generated {len(debrief.get('video_ideas', []))} video ideas")

    if dry_run:
        print("\n--- DRY RUN OUTPUT ---")
        print(json.dumps({"metrics": metrics, "debrief": debrief}, indent=2))
        return metrics, debrief, None

    print("[3/4] Creating Notion debrief page...")
    notion_url = create_debrief_page(metrics, debrief)
    print(f"  Created: {notion_url}")

    print("[4/4] Sending email brief...")
    if GMAIL_APP_PW:
        send_email_brief(metrics, debrief, notion_url)
    else:
        print("  Skipped — GMAIL_APP_PASSWORD not set in .env")

    print("=== Done ===")
    return metrics, debrief, notion_url


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    run(dry_run=dry)
