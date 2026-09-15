"""
Social Analytics Fetcher
Pulls public profile stats from Instagram, TikTok, YouTube via Apify.
Saves to content-output/analytics/social_stats.json for the dashboard.

Usage:
  python scripts/fetch_analytics.py
  python scripts/fetch_analytics.py --quick   # skip reels detail, just profile counts
"""

import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
OUTPUT = ROOT / "content-output" / "analytics" / "social_stats.json"

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

import requests

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
APIFY_BASE  = "https://api.apify.com/v2"

ACCOUNTS = {
    "digi":   {"ig": "digimaids",     "tiktok": "digimaids",     "yt": ""},
    "manasa": {"ig": "manasa_mdoju",  "tiktok": "manasa_mdoju",  "yt": ""},
    "bwh":    {"ig": "buildwithher_", "tiktok": "buildwithher_", "yt": ""},
}


# ── APIFY HELPERS ──────────────────────────────────────────────────────────

def run_actor(actor_id: str, input_data: dict, timeout_secs: int = 120) -> list:
    """Run an Apify actor synchronously and return dataset items."""
    url = f"{APIFY_BASE}/acts/{actor_id}/run-sync-get-dataset-items"
    params = {"token": APIFY_TOKEN, "timeout": timeout_secs, "memory": 256}
    try:
        resp = requests.post(url, json=input_data, params=params, timeout=timeout_secs + 30)
        resp.raise_for_status()
        return resp.json() if isinstance(resp.json(), list) else []
    except Exception as e:
        print(f"  [Apify] {actor_id} failed: {e}")
        return []


def run_actor_async(actor_id: str, input_data: dict, poll_secs: int = 120) -> list:
    """Start actor, poll until done, return items."""
    # Start run
    start_url = f"{APIFY_BASE}/acts/{actor_id}/runs"
    params = {"token": APIFY_TOKEN, "memory": 256}
    try:
        resp = requests.post(start_url, json=input_data, params=params, timeout=30)
        resp.raise_for_status()
        run = resp.json().get("data", {})
        run_id = run.get("id")
        dataset_id = run.get("defaultDatasetId")
        if not run_id:
            return []
    except Exception as e:
        print(f"  [Apify] Start failed for {actor_id}: {e}")
        return []

    # Poll for completion
    deadline = time.time() + poll_secs
    while time.time() < deadline:
        time.sleep(8)
        try:
            status_resp = requests.get(
                f"{APIFY_BASE}/acts/{actor_id}/runs/{run_id}",
                params={"token": APIFY_TOKEN}, timeout=15
            )
            status = status_resp.json().get("data", {}).get("status", "")
            if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
                break
        except Exception:
            pass

    # Fetch dataset
    try:
        items_resp = requests.get(
            f"{APIFY_BASE}/datasets/{dataset_id}/items",
            params={"token": APIFY_TOKEN, "clean": "true"}, timeout=30
        )
        return items_resp.json() if isinstance(items_resp.json(), list) else []
    except Exception as e:
        print(f"  [Apify] Dataset fetch failed: {e}")
        return []


# ── INSTAGRAM ──────────────────────────────────────────────────────────────

def fetch_instagram(usernames: list[str]) -> dict:
    """Returns {username: {followers, following, posts, avg_views, avg_likes}}"""
    print("  Fetching Instagram profiles...")
    items = run_actor_async("apify~instagram-profile-scraper", {
        "usernames": usernames,
    })

    results = {}
    for item in items:
        username = (item.get("username") or "").lower()
        followers = item.get("followersCount") or item.get("followers") or 0
        following = item.get("followsCount") or item.get("following") or 0
        posts     = item.get("postsCount") or item.get("mediaCount") or 0

        # Get avg views from recent posts if available
        recent = item.get("latestPosts") or item.get("posts") or []
        views_list = [p.get("videoViewCount") or p.get("videoPlayCount") or 0 for p in recent if p.get("type") in ("Video", "Reel", "video", "reel")]
        likes_list = [p.get("likesCount") or p.get("likes") or 0 for p in recent]
        avg_views = int(sum(views_list) / len(views_list)) if views_list else 0
        avg_likes = int(sum(likes_list) / len(likes_list)) if likes_list else 0

        results[username] = {
            "followers": followers,
            "following": following,
            "posts": posts,
            "avg_views": avg_views,
            "avg_likes": avg_likes,
        }
        print(f"    @{username}: {followers:,} followers, {posts} posts, {avg_views:,} avg views")

    return results


# ── TIKTOK ─────────────────────────────────────────────────────────────────

def fetch_tiktok(usernames: list[str]) -> dict:
    """Returns {username: {followers, likes, videos, avg_views}}"""
    print("  Fetching TikTok profiles...")
    results = {}
    for username in usernames:
        items = run_actor_async("clockworks~tiktok-scraper", {
            "profiles": [f"https://www.tiktok.com/@{username}"],
            "shouldDownloadVideos": False,
            "shouldDownloadCovers": False,
        }, poll_secs=120)

        for item in items:
            uname = (item.get("authorMeta", {}).get("name") or username).lower()
            stats = item.get("authorMeta", {}) if "authorMeta" in item else item
            followers = stats.get("fans") or stats.get("followers") or stats.get("followerCount") or 0
            likes     = stats.get("heart") or stats.get("heartCount") or stats.get("likesCount") or 0
            videos    = stats.get("video") or stats.get("videoCount") or 0

            # Try to get avg views from recent videos
            recent_videos = item.get("videos") or []
            view_counts = [v.get("playCount") or v.get("views") or 0 for v in recent_videos[:10]]
            avg_views = int(sum(view_counts) / len(view_counts)) if view_counts else 0

            results[username.lower()] = {
                "followers": followers,
                "likes": likes,
                "videos": videos,
                "avg_views": avg_views,
            }
            print(f"    @{username}: {followers:,} followers, {avg_views:,} avg views")
            break
        else:
            print(f"    @{username}: no data returned")

    return results


# ── YOUTUBE ────────────────────────────────────────────────────────────────

def fetch_youtube(channel_handles: dict) -> dict:
    """channel_handles = {key: '@handle' or channel_id}. Returns {key: {subscribers, videos, views}}"""
    print("  Fetching YouTube channels...")
    results = {}
    for key, handle in channel_handles.items():
        if not handle:
            continue
        items = run_actor_async("streamers~youtube-channel-scraper", {
            "startUrls": [{"url": f"https://www.youtube.com/{handle}"}],
            "maxResults": 1,
        }, poll_secs=90)

        for item in items:
            subs   = item.get("subscriberCount") or item.get("subscribers") or 0
            videos = item.get("videoCount") or item.get("videos") or 0
            views  = item.get("viewCount") or item.get("views") or 0
            results[key] = {"subscribers": subs, "videos": videos, "views": views}
            print(f"    {handle}: {subs:,} subscribers")
            break
        else:
            print(f"    {handle}: no data returned")

    return results


# ── ASSEMBLE & SAVE ─────────────────────────────────────────────────────────

def build_stats(ig_data: dict, tt_data: dict, yt_data: dict) -> dict:
    stats = {}
    mapping = {
        "digi":   ACCOUNTS["digi"]["ig"],
        "manasa": ACCOUNTS["manasa"]["ig"],
        "bwh":    ACCOUNTS["bwh"]["ig"],
    }

    for key, ig_handle in mapping.items():
        ig = ig_data.get(ig_handle.lower(), {})
        tt = tt_data.get(ACCOUNTS[key]["tiktok"].lower(), {})
        yt = yt_data.get(key, {})

        stats[key] = {
            "ig_followers":      ig.get("followers", 0),
            "ig_avg_views":      ig.get("avg_views", 0),
            "ig_avg_likes":      ig.get("avg_likes", 0),
            "ig_posts":          ig.get("posts", 0),
            "tiktok_followers":  tt.get("followers", 0),
            "tiktok_avg_views":  tt.get("avg_views", 0),
            "tiktok_videos":     tt.get("videos", 0),
            "youtube_subs":      yt.get("subscribers", 0),
            "youtube_videos":    yt.get("videos", 0),
            "youtube_views":     yt.get("views", 0),
        }

    return stats


def save_stats(stats: dict):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "accounts": stats,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2))
    print(f"\nSaved to {OUTPUT}")

    # Also write a JS file so the dashboard can load analytics without the proxy server
    js_file = ROOT / "dashboard" / "analytics-data.js"
    js_file.write_text(f"window.ANALYTICS_DATA = {json.dumps(payload, indent=2)};")
    print(f"Saved JS bundle to {js_file}")

    return payload


def run(quick=False):
    print("=== Social Analytics Fetch ===")
    if not APIFY_TOKEN:
        print("ERROR: APIFY_TOKEN not set in .env")
        return

    ig_usernames = [ACCOUNTS[k]["ig"] for k in ACCOUNTS if ACCOUNTS[k]["ig"]]
    tt_usernames = [ACCOUNTS[k]["tiktok"] for k in ACCOUNTS if ACCOUNTS[k]["tiktok"]]
    yt_handles   = {k: ACCOUNTS[k]["yt"] for k in ACCOUNTS if ACCOUNTS[k]["yt"]}

    print("\n[1/3] Instagram")
    ig_data = fetch_instagram(ig_usernames)

    print("\n[2/3] TikTok")
    tt_data = fetch_tiktok(tt_usernames)

    print("\n[3/3] YouTube")
    yt_data = fetch_youtube(yt_handles) if yt_handles else {}

    stats = build_stats(ig_data, tt_data, yt_data)
    payload = save_stats(stats)

    print("\n=== Summary ===")
    for key, s in stats.items():
        label = {"digi": "@digimaids", "manasa": "@manasa_mdoju", "bwh": "@buildwithher"}[key]
        print(f"{label}: IG {s['ig_followers']:,} | TikTok {s['tiktok_followers']:,} | YT {s['youtube_subs']:,} subs")

    return payload


if __name__ == "__main__":
    quick = "--quick" in sys.argv
    run(quick=quick)
