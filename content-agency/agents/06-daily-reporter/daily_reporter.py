"""
Daily Reporter Agent
Runs every morning at 7am (via n8n cron).
Checks all 3 Notion content calendars + interview pipeline queue.
Sends a morning brief email via Gmail (SMTP).

Set env vars:
  NOTION_PERSONAL_KEY
  NOTION_DIGIMAIDS_KEY
  NOTION_DIGIMAIDS_CALENDAR_DB_ID
  NOTION_PERSONAL_CALENDAR_DB_ID    (optional — personal brand calendar)
  NOTION_BWH_CALENDAR_DB_ID         (optional — BWH calendar)
  NOTION_INTERVIEW_PIPELINE_DB_ID   (the Interview Pipeline DB)
  GMAIL_SENDER                      (your Gmail address, e.g. mamidoju.manasa@gmail.com)
  GMAIL_APP_PASSWORD                (Gmail App Password — not your regular password)
  GMAIL_RECIPIENT                   (where to send the brief — usually same as sender)
"""

import os
import sys
from datetime import date, timedelta
from pathlib import Path

from notion_client import Client as NotionClient

NOTION_PERSONAL_KEY = os.environ.get("NOTION_PERSONAL_KEY", "")
NOTION_DIGIMAIDS_KEY = os.environ.get("NOTION_DIGIMAIDS_KEY", "")

NOTION_INTERVIEW_DB_ID = os.environ.get("NOTION_INTERVIEW_PIPELINE_DB_ID", "21dd959e-2539-4e64-821c-4953c0662d07")
NOTION_DIGIMAIDS_CALENDAR_DB_ID = os.environ.get("NOTION_DIGIMAIDS_CALENDAR_DB_ID", "")
NOTION_PERSONAL_CALENDAR_DB_ID = os.environ.get("NOTION_PERSONAL_CALENDAR_DB_ID", "")
NOTION_BWH_CALENDAR_DB_ID = os.environ.get("NOTION_BWH_CALENDAR_DB_ID", "")

GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "mamidoju.manasa@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
GMAIL_RECIPIENT = os.environ.get("GMAIL_RECIPIENT", GMAIL_SENDER)

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def get_notion_client(key: str) -> NotionClient:
    return NotionClient(auth=key)


def query_calendar(notion: NotionClient, db_id: str, target_date: str) -> list[dict]:
    """Return all calendar entries for a specific date."""
    if not db_id:
        return []
    try:
        response = notion.databases.query(
            database_id=db_id,
            filter={
                "property": "Post Date",
                "date": {"equals": target_date},
            },
        )
        return response.get("results", [])
    except Exception as e:
        print(f"[Daily Reporter] Calendar query error ({db_id}): {e}")
        return []


def get_interview_queue(notion: NotionClient) -> list[dict]:
    """Get next 3 interviews ready to post (Stage = Approved or Short Form Clip Ready = true)."""
    try:
        response = notion.databases.query(
            database_id=NOTION_INTERVIEW_DB_ID,
            filter={
                "or": [
                    {"property": "Stage", "select": {"equals": "Approved"}},
                    {"property": "Short Form Clip Ready", "checkbox": {"equals": True}},
                ]
            },
            sorts=[{"property": "Post Date", "direction": "ascending"}],
            page_size=3,
        )
        return response.get("results", [])
    except Exception as e:
        print(f"[Daily Reporter] Interview queue error: {e}")
        return []


def get_overdue_interviews(notion: NotionClient) -> list[dict]:
    """Get interviews with AI Brief Sent = false and Stage >= Approved."""
    try:
        response = notion.databases.query(
            database_id=NOTION_INTERVIEW_DB_ID,
            filter={
                "and": [
                    {"property": "AI Brief Sent", "checkbox": {"equals": False}},
                    {
                        "or": [
                            {"property": "Stage", "select": {"equals": "Approved"}},
                            {"property": "Stage", "select": {"equals": "Scheduled"}},
                        ]
                    },
                ]
            },
            page_size=5,
        )
        return response.get("results", [])
    except Exception as e:
        print(f"[Daily Reporter] Overdue check error: {e}")
        return []


def get_page_title(page: dict) -> str:
    props = page.get("properties", {})
    for key in ["Name", "Guest Name", "Title"]:
        if key in props:
            title_arr = props[key].get("title", [])
            if title_arr:
                return title_arr[0].get("plain_text", "Untitled")
    return "Untitled"


def get_text_prop(page: dict, prop_name: str) -> str:
    props = page.get("properties", {})
    prop = props.get(prop_name, {})
    rich = prop.get("rich_text", [])
    if rich:
        return rich[0].get("plain_text", "")
    return prop.get("select", {}).get("name", "")


def format_calendar_entries(entries: list[dict], account_label: str) -> str:
    if not entries:
        return f"  {account_label}: Nothing scheduled"
    lines = []
    for e in entries:
        title = get_page_title(e)
        status = get_text_prop(e, "Status") or get_text_prop(e, "Stage") or ""
        lines.append(f"  {account_label}: {title}" + (f" [{status}]" if status else ""))
    return "\n".join(lines)


def format_interview_queue(interviews: list[dict]) -> str:
    if not interviews:
        return "  No interviews ready to post."
    lines = []
    for i, iv in enumerate(interviews, 1):
        name = get_page_title(iv)
        hook = get_text_prop(iv, "Hook Quote") or get_text_prop(iv, "Hook Moment Notes") or "No hook yet"
        stage = get_text_prop(iv, "Stage") or ""
        lines.append(f"  {i}. {name} [{stage}]\n     Hook: {hook[:80]}{'...' if len(hook) > 80 else ''}")
    return "\n".join(lines)


def format_action_needed(overdue: list[dict]) -> str:
    if not overdue:
        return "  All clear."
    lines = ["  ACTION NEEDED — AI brief not sent:"]
    for item in overdue:
        name = get_page_title(item)
        lines.append(f"  • {name}")
    return "\n".join(lines)


def build_morning_brief(
    today_str: str,
    day_name: str,
    digimaids_entries: list[dict],
    personal_entries: list[dict],
    bwh_entries: list[dict],
    interview_queue: list[dict],
    overdue: list[dict],
) -> str:
    separator = "─" * 30

    brief = f"""☀️ GOOD MORNING, MANASA
{today_str} | {day_name}
{separator}

📅 TODAY — WHAT TO POST

{format_calendar_entries(digimaids_entries, "@digimaids")}
{format_calendar_entries(personal_entries, "@manasa_mdoju")}
{format_calendar_entries(bwh_entries, "@buildwithher")}

{separator}

🎤 INTERVIEW QUEUE — NEXT 3 READY

{format_interview_queue(interview_queue)}

{separator}

⚠️ FLAGS

{format_action_needed(overdue)}

{separator}

Go build something real today. 💜
"""
    return brief.strip()


def send_email(subject: str, body: str) -> None:
    import smtplib
    from email.mime.text import MIMEText

    if not GMAIL_APP_PASSWORD:
        print("[Daily Reporter] GMAIL_APP_PASSWORD not set. Printing brief instead:")
        print(body)
        return

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = GMAIL_SENDER
    msg["To"] = GMAIL_RECIPIENT

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_SENDER, GMAIL_RECIPIENT, msg.as_string())
        print(f"[Daily Reporter] Morning brief sent to {GMAIL_RECIPIENT}.")
    except Exception as e:
        print(f"[Daily Reporter] Gmail error: {e}")
        print(body)


def run() -> str:
    today = date.today()
    today_str = today.isoformat()
    day_name = DAY_NAMES[today.weekday()]

    notion_personal = get_notion_client(NOTION_PERSONAL_KEY) if NOTION_PERSONAL_KEY else None
    notion_digimaids = get_notion_client(NOTION_DIGIMAIDS_KEY) if NOTION_DIGIMAIDS_KEY else None

    # Query calendars
    digimaids_entries = query_calendar(notion_digimaids, NOTION_DIGIMAIDS_CALENDAR_DB_ID, today_str) if notion_digimaids else []
    personal_entries = query_calendar(notion_personal, NOTION_PERSONAL_CALENDAR_DB_ID, today_str) if notion_personal else []
    bwh_entries = query_calendar(notion_personal, NOTION_BWH_CALENDAR_DB_ID, today_str) if notion_personal else []

    # Interview pipeline
    notion_interviews = get_notion_client(NOTION_PERSONAL_KEY) if NOTION_PERSONAL_KEY else None
    interview_queue = get_interview_queue(notion_interviews) if notion_interviews else []
    overdue = get_overdue_interviews(notion_interviews) if notion_interviews else []

    brief = build_morning_brief(
        today_str, day_name,
        digimaids_entries, personal_entries, bwh_entries,
        interview_queue, overdue,
    )

    subject = f"☀️ Morning Brief — {day_name} {today_str}"
    send_email(subject, brief)
    return brief


if __name__ == "__main__":
    result = run()
    print(result)
