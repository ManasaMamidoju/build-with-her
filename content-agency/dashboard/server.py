"""
Local proxy server for the Command Center dashboard.
Proxies Notion API calls to avoid CORS restrictions in the browser.

Run:
  python dashboard/server.py

Then open: http://localhost:8765/command-center.html

Requires: pip install requests
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import requests

PORT = 8765
DASHBOARD_DIR = Path(__file__).parent
ROOT_DIR = DASHBOARD_DIR.parent
ANALYTICS_FILE = ROOT_DIR / "content-output" / "analytics" / "social_stats.json"
AI_NEWS_CACHE = ROOT_DIR / "content-output" / "analytics" / "ai_news_cache.json"

NOTION_VERSION = "2022-06-28"


class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Server] {self.address_string()} - {format % args}")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)

        # Serve static files
        if parsed.path == "/" or parsed.path == "/command-center.html":
            self._serve_file(DASHBOARD_DIR / "command-center.html", "text/html")
        elif parsed.path == "/analytics":
            if ANALYTICS_FILE.exists():
                self._serve_file(ANALYTICS_FILE, "application/json")
            else:
                self._json_response(404, {"error": "No analytics data yet. Run: python scripts/fetch_analytics.py"})
        elif parsed.path.endswith(".css"):
            self._serve_file(DASHBOARD_DIR / parsed.path.lstrip("/"), "text/css")
        elif parsed.path.endswith(".js"):
            self._serve_file(DASHBOARD_DIR / parsed.path.lstrip("/"), "application/javascript")
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/notion-proxy":
            self._handle_notion_proxy()
        elif parsed.path == "/run-ai-news":
            self._handle_ai_news()
        elif parsed.path == "/schedule-ai-news":
            self._handle_schedule_ai_news()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_ai_news(self):
        """Run the AI news finder script and return top 5 results as JSON."""
        import subprocess, sys
        try:
            result = subprocess.run(
                [sys.executable, str(ROOT_DIR / "agents" / "10-ai-news-finder" / "ai_news_finder.py"), "--preview"],
                capture_output=True, text=True, timeout=120, cwd=str(ROOT_DIR)
            )
            # Parse the JSON from stdout (script prints results then returns)
            # The script writes results to a cache file too
            output = result.stdout + result.stderr
            # Try to load from cache file written by the script
            if AI_NEWS_CACHE.exists():
                data = json.loads(AI_NEWS_CACHE.read_text())
                self._json_response(200, {"results": data, "raw": output[-2000:]})
            else:
                self._json_response(500, {"error": "Script ran but no cache file found", "raw": output[-2000:]})
        except subprocess.TimeoutExpired:
            self._json_response(504, {"error": "Script timed out (>120s)"})
        except Exception as e:
            self._json_response(500, {"error": str(e)})

    def _handle_schedule_ai_news(self):
        """Create a Notion DigiMAIDS calendar entry for a picked AI news item."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            item = body.get("item", {})
            if not item:
                self._json_response(400, {"error": "No item provided"})
                return

            import os, sys
            from datetime import date, timedelta
            sys.path.insert(0, str(ROOT_DIR))
            from dotenv import load_dotenv
            load_dotenv(ROOT_DIR / ".env")
            from notion_client import Client as NotionClient

            notion_key = os.getenv("NOTION_DIGIMAIDS_KEY")
            db_id = os.getenv("NOTION_DIGIMAIDS_CALENDAR_DB_ID", "305b8948348d80999df2d1b209800cec")
            notion = NotionClient(auth=notion_key)

            today = date.today()
            days_until_tuesday = (1 - today.weekday()) % 7 or 7
            post_date = today + timedelta(days=days_until_tuesday)

            script_outline = (
                f"## Hook\n{item.get('hook','')}\n\n"
                f"## Topic\n{item.get('topic','')}\n\n"
                f"## Our Angle\n{item.get('digimaids_angle','')}\n\n"
                f"## Why It Works\n{item.get('why_it_works','')}\n\n"
                f"## Inspired By\n{item.get('creator','')} on {item.get('platform','')}\n\n"
                f"## Script Notes\n- Open with hook text on screen\n"
                f"- Break down the AI tool/news in 3 bullet points\n"
                f"- Connect to DigiMAIDS service offering\n"
                f"- CTA: Follow for weekly AI business breakdowns\n"
            )

            page = notion.pages.create(
                parent={"database_id": db_id},
                properties={
                    "Content name": {"title": [{"text": {"content": item.get("hook", "AI News")}}]},
                    "Publish date": {"date": {"start": post_date.isoformat()}},
                    "Content Type": {"select": {"name": "Trending AI News"}},
                    "Status": {"select": {"name": "Script Ready"}},
                },
                children=[{"object": "block", "type": "paragraph", "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": script_outline}}]
                }}]
            )
            self._json_response(200, {"url": page["url"], "post_date": post_date.isoformat()})
        except Exception as e:
            self._json_response(500, {"error": str(e)})

    def _serve_file(self, path: Path, content_type: str):
        if not path.exists():
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"File not found")
            return
        content = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(content)

    def _handle_notion_proxy(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))

            notion_token = body.get("token", "")
            notion_path = body.get("path", "")
            method = body.get("method", "GET").upper()
            payload = body.get("payload", {})

            if not notion_token or not notion_path:
                self._json_response(400, {"error": "Missing token or path"})
                return

            url = f"https://api.notion.com/v1/{notion_path.lstrip('/')}"
            headers = {
                "Authorization": f"Bearer {notion_token}",
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            }

            if method == "POST":
                resp = requests.post(url, headers=headers, json=payload, timeout=15)
            else:
                resp = requests.get(url, headers=headers, timeout=15)

            self._json_response(resp.status_code, resp.json())

        except Exception as e:
            self._json_response(500, {"error": str(e)})

    def _json_response(self, status: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), ProxyHandler)
    print(f"Command Center running at: http://localhost:{PORT}/command-center.html")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
