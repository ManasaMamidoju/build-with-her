"""
Pipeline Runner — Master Orchestration
Runs daily at 6am via n8n cron.

Order: Trend Scout → Script Writer → Caption Writer → Daily Reporter

- Skips downstream agents if an upstream agent fails.
- Logs everything to logs/pipeline.log
- Sends WhatsApp error alerts on failure.

Usage:
  python run_pipeline.py                     # full pipeline
  python run_pipeline.py --skip-trend-scout  # use saved trend output
  python run_pipeline.py --day Thursday      # override day of week
  python run_pipeline.py --account digimaids --topic "AI replaces VA tasks"
"""

import argparse
import json
import logging
import os
import sys
import traceback
from datetime import date
from pathlib import Path

# Ensure project root is importable
ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

LOG_DIR = ROOT / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "pipeline.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("pipeline")

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def get_today_day() -> str:
    return DAY_NAMES[date.today().weekday()]


def send_error_alert(message: str) -> None:
    """Send an email alert if pipeline fails. Reuses Daily Reporter's send logic."""
    try:
        from agents.daily_reporter import daily_reporter as dr
        dr.send_email("🚨 Pipeline Error — Action Required", f"🚨 PIPELINE ERROR\n\n{message}")
    except Exception as e:
        log.error(f"Could not send error alert: {e}")


def run_trend_scout() -> list[dict] | None:
    log.info("--- Step 1: Trend Scout ---")
    try:
        from agents.trend_scout import trend_scout
        trends = trend_scout.run()
        log.info(f"Trend Scout complete. Found {len(trends)} trends.")

        # Save output for downstream agents
        output_path = ROOT / "logs" / f"trends_{date.today().isoformat()}.json"
        output_path.write_text(json.dumps(trends, indent=2, default=str), encoding="utf-8")
        log.info(f"Trends saved to {output_path}")
        return trends
    except Exception as e:
        log.error(f"Trend Scout failed: {e}\n{traceback.format_exc()}")
        send_error_alert(f"Trend Scout failed: {e}")
        return None


def load_latest_trends() -> list[dict] | None:
    """Load the most recent saved trend output."""
    trend_files = sorted(LOG_DIR.glob("trends_*.json"), reverse=True)
    if not trend_files:
        log.warning("No saved trend files found.")
        return None
    data = json.loads(trend_files[0].read_text(encoding="utf-8"))
    log.info(f"Loaded trends from {trend_files[0].name}")
    return data


def run_script_writer(
    trends: list[dict] | None,
    account: str,
    day: str,
    topic: str = "",
) -> dict | None:
    log.info("--- Step 2: Script Writer ---")
    try:
        from agents.script_writer import script_writer

        extra_context = ""
        if trends and not topic:
            top = trends[0]
            topic = top.get("trend_summary", "AI automation for coaches")
            extra_context = (
                f"Hook suggestion: {top.get('hook_copy', '')}\n"
                f"Suggested angle: {top.get('suggested_angle', '')}"
            )

        if not topic:
            topic = "AI automation tools for women coaches"

        result = script_writer.write_script(topic, account, day, extra_context)
        path = script_writer.save_script(result)
        log.info(f"Script saved to {path}")
        return {"result": result, "path": str(path)}
    except Exception as e:
        log.error(f"Script Writer failed: {e}\n{traceback.format_exc()}")
        send_error_alert(f"Script Writer failed: {e}")
        return None


def run_caption_writer(
    script_output: dict | None,
    account: str,
    day: str,
    topic: str = "",
) -> dict | None:
    log.info("--- Step 3: Caption Writer ---")
    try:
        from agents.caption_writer import caption_writer

        script_path = script_output["path"] if script_output else ""
        script_content = ""
        if script_path:
            script_content = Path(script_path).read_text(encoding="utf-8")

        if not topic and script_output:
            topic = script_output["result"].get("topic", "")

        result = caption_writer.write_caption(account, day, topic, script_content)
        path = caption_writer.save_caption(result, script_path)
        log.info(f"Caption saved to {path}")
        return {"result": result, "path": str(path)}
    except Exception as e:
        log.error(f"Caption Writer failed: {e}\n{traceback.format_exc()}")
        send_error_alert(f"Caption Writer failed: {e}")
        return None


def run_daily_reporter() -> str | None:
    log.info("--- Step 4: Daily Reporter ---")
    try:
        from agents.daily_reporter import daily_reporter
        brief = daily_reporter.run()
        log.info("Daily Reporter complete. Morning brief sent.")
        return brief
    except Exception as e:
        log.error(f"Daily Reporter failed: {e}\n{traceback.format_exc()}")
        send_error_alert(f"Daily Reporter failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Run the full content pipeline")
    parser.add_argument("--skip-trend-scout", action="store_true",
                        help="Skip Trend Scout and use last saved trends")
    parser.add_argument("--day", type=str, default="",
                        help="Override day of week (Monday-Saturday)")
    parser.add_argument("--account", type=str, default="digimaids",
                        choices=["digimaids", "personal", "bwh"],
                        help="Which account to write content for")
    parser.add_argument("--topic", type=str, default="",
                        help="Override topic (skips trend-based topic selection)")
    parser.add_argument("--skip-reporter", action="store_true",
                        help="Skip Daily Reporter (useful for testing)")
    args = parser.parse_args()

    day = args.day or get_today_day()
    today = date.today().isoformat()

    log.info(f"=== Pipeline starting | {today} | {day} | account={args.account} ===")

    # Step 1: Trend Scout
    if args.skip_trend_scout:
        trends = load_latest_trends()
    else:
        trends = run_trend_scout()

    # Step 2: Script Writer (continues even if trends failed)
    script_output = run_script_writer(trends, args.account, day, args.topic)

    # Step 3: Caption Writer (requires script output)
    caption_output = None
    if script_output:
        caption_output = run_caption_writer(script_output, args.account, day, args.topic)
    else:
        log.warning("Skipping Caption Writer — no script output.")

    # Step 4: Daily Reporter (always runs last, independent)
    if not args.skip_reporter:
        run_daily_reporter()

    # Summary
    log.info("=== Pipeline complete ===")
    log.info(f"  Trends:  {'OK' if trends else 'FAILED/SKIPPED'}")
    log.info(f"  Script:  {'OK — ' + script_output['path'] if script_output else 'FAILED'}")
    log.info(f"  Caption: {'OK — ' + caption_output['path'] if caption_output else 'FAILED/SKIPPED'}")
    log.info(f"  Reporter: {'OK' if not args.skip_reporter else 'SKIPPED'}")


if __name__ == "__main__":
    main()
