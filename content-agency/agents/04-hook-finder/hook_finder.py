#!/usr/bin/env python3
"""
Hook Finder Agent — DigiMAIDS Content System
Finds the best hook quote from an interview video.

Usage — single file (Google Drive):
    python hook_finder.py "https://drive.google.com/file/d/FILE_ID/view"

Usage — single file (local path):
    python hook_finder.py "C:\\path\\to\\video.mp4"

Usage — batch folder:
    python hook_finder.py --batch "C:\\path\\to\\folder" --output "workflows/output.md"
"""

import os
import re
import sys
import json
import tempfile
import argparse
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv

# Load .env from project root (two levels up from this file)
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

ANTHROPIC_API_KEY   = os.getenv("ANTHROPIC_API_KEY")
WHISPER_API_KEY     = os.getenv("WHISPER_API_KEY")
NOTION_PERSONAL_KEY = os.getenv("NOTION_PERSONAL_KEY")

NOTION_DB_NAME     = "BWH Interviews"
CLAUDE_MODEL       = "claude-sonnet-4-6"
WHISPER_SIZE_LIMIT = 24 * 1024 * 1024   # 24 MB hard limit
AUDIO_BITRATE_FULL = "128k"
AUDIO_BITRATE_SAFE = "48k"              # ~3.5 MB per hour of speech

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".m4v", ".webm", ".MP4", ".MOV"}

HOOK_PROMPT = """\
You are analyzing a recorded interview with a woman entrepreneur or professional.

From the transcript below, do two things:

1. Find the interviewee's name.
   She may introduce herself ("I'm Sarah", "My name is Sarah Johnson"),
   be introduced by someone else ("This is Sarah"), or sign off with her name.
   Look hardest in the first two minutes and the last minute.
   If no name appears anywhere, return "Unknown".

2. Find the single most surprising, relatable, or emotionally powerful quote —
   the one sentence or short exchange that would make someone stop scrolling
   in the first three seconds of a Reel. Prioritise moments that are:
   - Unexpectedly honest or vulnerable
   - Counter-intuitive or bold
   - Specific and grounded (not generic)
   - Emotionally charged

Return ONLY valid JSON — no markdown fences, no extra text — in this exact shape:
{{
  "interviewee_name": "<first and last name, or first name only if that is all given>",
  "quote": "<exact verbatim quote from the transcript>",
  "timestamp_start": "<MM:SS>",
  "timestamp_end": "<MM:SS>",
  "why_it_works": "<one sentence explaining why this hooks a viewer>",
  "brief_card": "<60-word editor brief card formatted for WhatsApp>"
}}

TRANSCRIPT (with segment timestamps):
{transcript}
"""


# ---------------------------------------------------------------------------
# Input detection
# ---------------------------------------------------------------------------

def is_local_path(s: str) -> bool:
    """Return True if the input is a local filesystem path rather than a URL."""
    # Windows drive letter  (C:\, D:\, etc.)
    if re.match(r"^[A-Za-z]:\\", s):
        return True
    # Unix-style absolute path that actually exists
    if s.startswith("/") and os.path.exists(s):
        return True
    return False


# ---------------------------------------------------------------------------
# Step 1a — Resolve local file (no download needed)
# ---------------------------------------------------------------------------

def resolve_local(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Local file not found: {file_path}")
    size_mb = os.path.getsize(file_path) / 1_048_576
    print(f"\n[1/4] Local file: {file_path} ({size_mb:.0f} MB)")
    return file_path


# ---------------------------------------------------------------------------
# Step 1b — Download from Google Drive
# ---------------------------------------------------------------------------

def extract_drive_file_id(url: str) -> str:
    for pattern in [r"/file/d/([a-zA-Z0-9_-]+)", r"[?&]id=([a-zA-Z0-9_-]+)"]:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    raise ValueError(
        f"Could not extract a file ID from: {url}\n"
        "Make sure the URL is a standard Google Drive share link."
    )


def download_video(drive_url: str, output_path: str) -> str:
    try:
        import gdown
    except ImportError:
        sys.exit("ERROR: gdown is not installed.  Run: pip install gdown")

    print(f"\n[1/4] Downloading from Google Drive...")
    file_id = extract_drive_file_id(drive_url)
    gdown.download(f"https://drive.google.com/uc?id={file_id}",
                   output_path, quiet=False)

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        sys.exit("ERROR: Download failed or produced an empty file.\n"
                 "Make sure the Drive link is set to 'Anyone with the link can view'.")

    size_mb = os.path.getsize(output_path) / 1_048_576
    print(f"  Downloaded: {size_mb:.1f} MB")
    return output_path


# ---------------------------------------------------------------------------
# Step 2 — Extract audio (with automatic compression for large files)
# ---------------------------------------------------------------------------

def extract_audio(video_path: str, audio_path: str) -> str:
    try:
        from moviepy import VideoFileClip  # moviepy 2.x
    except ImportError:
        try:
            from moviepy.editor import VideoFileClip  # moviepy 1.x fallback
        except ImportError:
            sys.exit("ERROR: moviepy is not installed.  Run: pip install moviepy")

    print(f"\n[2/4] Extracting audio...")
    clip = VideoFileClip(video_path)
    duration = clip.duration

    # First pass — try full-quality extraction
    clip.audio.write_audiofile(audio_path, bitrate=AUDIO_BITRATE_FULL)
    clip.close()

    size = os.path.getsize(audio_path)

    # If the audio exceeds Whisper's limit, re-encode at a much lower bitrate.
    # 48 kbps is still fine for speech recognition.
    if size > WHISPER_SIZE_LIMIT:
        compressed_path = audio_path.replace(".mp3", "_compressed.mp3")
        print(f"  Audio is {size / 1_048_576:.1f} MB — re-encoding at {AUDIO_BITRATE_SAFE} "
              f"to stay under Whisper's 25 MB limit...")

        clip2 = VideoFileClip(video_path)
        clip2.audio.write_audiofile(compressed_path, bitrate=AUDIO_BITRATE_SAFE)
        clip2.close()
        os.remove(audio_path)
        os.rename(compressed_path, audio_path)
        size = os.path.getsize(audio_path)

    size_mb = size / 1_048_576
    print(f"  Audio ready: {size_mb:.1f} MB, {duration:.0f}s")

    if size > WHISPER_SIZE_LIMIT:
        raise RuntimeError(
            f"Audio is still {size_mb:.1f} MB after compression — "
            "video may be too long for Whisper.  Try splitting it first."
        )

    return audio_path


# ---------------------------------------------------------------------------
# Step 3 — Transcribe with Whisper
# ---------------------------------------------------------------------------

def build_timestamped_transcript(segments) -> str:
    lines = []
    for seg in segments:
        minutes = int(seg.start // 60)
        seconds = int(seg.start % 60)
        lines.append(f"[{minutes:02d}:{seconds:02d}] {seg.text.strip()}")
    return "\n".join(lines)


def transcribe_audio(audio_path: str) -> tuple[str, str]:
    """Returns (plain_text, timestamped_transcript).

    Uses Google Speech Recognition (free, no API key needed).
    For long files, splits into 30-second chunks automatically.
    """
    try:
        import speech_recognition as sr
    except ImportError:
        sys.exit("ERROR: SpeechRecognition is not installed. Run: pip install SpeechRecognition")

    print(f"\n[3/4] Transcribing with Google Speech Recognition (free)...")

    recognizer = sr.Recognizer()
    audio_file = Path(audio_path)

    # Convert mp3/m4a to wav if needed (SR works best with wav)
    wav_path = audio_file.with_suffix(".wav")
    if not wav_path.exists():
        print(f"  Converting to WAV...")
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(str(audio_file))
            audio.export(str(wav_path), format="wav")
        except Exception as e:
            # Fallback: try ffmpeg directly
            import subprocess
            subprocess.run(
                ["ffmpeg", "-i", str(audio_file), "-ar", "16000", "-ac", "1", str(wav_path)],
                check=True, capture_output=True
            )

    segments = []
    full_text_parts = []

    # Process in 30-second chunks for reliability
    with sr.AudioFile(str(wav_path)) as source:
        duration = source.DURATION
        chunk_sec = 30
        offset = 0.0

        while offset < duration:
            with sr.AudioFile(str(wav_path)) as src:
                audio_chunk = recognizer.record(src, offset=offset, duration=min(chunk_sec, duration - offset))
            try:
                text = recognizer.recognize_google(audio_chunk)
                full_text_parts.append(text)
                m, s = divmod(int(offset), 60)
                segments.append(f"[{m:02d}:{s:02d}] {text}")
            except sr.UnknownValueError:
                pass
            except sr.RequestError as e:
                print(f"  Warning: Google SR request failed at {offset:.0f}s: {e}")
            offset += chunk_sec

    full_text = " ".join(full_text_parts)
    timestamped = "\n".join(segments)

    print(f"  Transcribed: {len(segments)} segments, {len(full_text)} characters")
    return full_text, timestamped


# ---------------------------------------------------------------------------
# Step 4 — Find hook + name with Claude
# ---------------------------------------------------------------------------

def find_hook(timestamped_transcript: str) -> dict:
    try:
        import anthropic
    except ImportError:
        sys.exit("ERROR: anthropic is not installed.  Run: pip install anthropic")

    if not ANTHROPIC_API_KEY:
        sys.exit("ERROR: ANTHROPIC_API_KEY is not set in .env")

    print(f"\n[4/4] Sending transcript to Claude ({CLAUDE_MODEL})...")
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": HOOK_PROMPT.format(transcript=timestamped_transcript),
        }],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if Claude added them
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if not m:
            raise ValueError(f"Claude returned unparseable output:\n{raw}")
        data = json.loads(m.group())

    required = ("interviewee_name", "quote", "timestamp_start",
                "timestamp_end", "why_it_works", "brief_card")
    for field in required:
        if field not in data:
            raise ValueError(
                f"Claude response missing field '{field}'.\nRaw: {raw}"
            )

    print(f"  Interviewee : {data['interviewee_name']}")
    print(f"  Hook at     : {data['timestamp_start']} - {data['timestamp_end']}")
    return data


# ---------------------------------------------------------------------------
# Notion update (single-file mode only; skipped in batch)
# ---------------------------------------------------------------------------

def update_notion(drive_url: str, quote: str,
                  timestamp: str, brief_card: str) -> None:
    try:
        from notion_client import Client as NotionClient
    except ImportError:
        print("  WARNING: notion-client not installed.  Skipping Notion update.")
        return

    if not NOTION_PERSONAL_KEY:
        print("  WARNING: NOTION_PERSONAL_KEY not set.  Skipping Notion update.")
        return

    print(f"  Updating Notion '{NOTION_DB_NAME}'...")
    notion = NotionClient(auth=NOTION_PERSONAL_KEY)

    search = notion.search(
        query=NOTION_DB_NAME,
        filter={"property": "object", "value": "database"},
    )
    if not search["results"]:
        print(f"  WARNING: Database '{NOTION_DB_NAME}' not found.  Skipping.")
        return

    db_id = search["results"][0]["id"]
    rows = notion.databases.query(
        database_id=db_id,
        filter={"property": "Drive Link", "url": {"contains": drive_url}},
    )
    if not rows["results"]:
        print("  WARNING: No matching row found for this Drive URL.  Skipping.")
        return

    notion.pages.update(
        page_id=rows["results"][0]["id"],
        properties={
            "Hook Quote":     {"rich_text": [{"text": {"content": quote[:2000]}}]},
            "Hook Timestamp": {"rich_text": [{"text": {"content": timestamp}}]},
            "AI Brief Sent":  {"checkbox": True},
        },
    )
    print("  Notion row updated.")


# ---------------------------------------------------------------------------
# Core pipeline — processes one video file end-to-end
# ---------------------------------------------------------------------------

def process_file(input_path: str, tmp_dir: str,
                 update_notion_flag: bool = False) -> dict:
    """
    Run the full pipeline for a single video.
    Returns a result dict (or raises on error).
    """
    audio_path = os.path.join(tmp_dir, "audio.mp3")

    if is_local_path(input_path):
        video_path = resolve_local(input_path)
    else:
        video_path = download_video(
            input_path, os.path.join(tmp_dir, "interview.mp4")
        )

    extract_audio(video_path, audio_path)
    _plain, timestamped = transcribe_audio(audio_path)
    hook = find_hook(timestamped)

    if update_notion_flag and not is_local_path(input_path):
        update_notion(
            input_path, hook["quote"],
            f"{hook['timestamp_start']} - {hook['timestamp_end']}",
            hook["brief_card"],
        )

    return hook


# ---------------------------------------------------------------------------
# Output formatting
# ---------------------------------------------------------------------------

def format_entry(filename: str, hook: dict) -> str:
    """Format one interview result as a markdown entry."""
    return (
        "---\n"
        f"FILE: {filename}\n"
        f"INTERVIEWEE NAME: {hook['interviewee_name']}\n"
        f"HOOK QUOTE: \"{hook['quote']}\"\n"
        f"TIMESTAMP: {hook['timestamp_start']} - {hook['timestamp_end']}\n"
        f"WHY IT WORKS: {hook['why_it_works']}\n"
        "EDITOR BRIEF:\n"
        f"{hook['brief_card']}\n"
        "---\n"
    )


def print_banner(text: str) -> None:
    print("\n" + "=" * 62)
    print(f"  {text}")
    print("=" * 62)


# ---------------------------------------------------------------------------
# Batch mode
# ---------------------------------------------------------------------------

def run_batch(folder: str, output_path: str) -> None:
    """Process every video in folder and write results to output_path."""
    folder_path = Path(folder)
    if not folder_path.is_dir():
        sys.exit(f"ERROR: Folder not found: {folder}")

    videos = sorted(
        p for p in folder_path.iterdir()
        if p.suffix in VIDEO_EXTENSIONS
    )
    if not videos:
        sys.exit(f"ERROR: No video files found in {folder}")

    print_banner(f"HOOK FINDER — BATCH MODE  ({len(videos)} videos)")
    print(f"  Output : {output_path}\n")

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    entries   = []
    successes = 0
    failures  = []

    for idx, video in enumerate(videos, 1):
        print(f"\n{'=' * 62}")
        print(f"  [{idx}/{len(videos)}] {video.name}")
        print("=" * 62)

        try:
            with tempfile.TemporaryDirectory() as tmp:
                hook = process_file(str(video), tmp, update_notion_flag=False)

            entry = format_entry(video.name, hook)
            entries.append(entry)
            successes += 1

            # Write incrementally so progress is saved even if later files fail
            with open(output_file, "w", encoding="utf-8") as f:
                header = (
                    f"# Elevate 2026 Conference — Interview Hook Finder\n"
                    f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
                    f"Source folder: {folder}\n"
                    f"Videos processed: {successes} / {len(videos)}\n\n"
                )
                f.write(header + "\n".join(entries))

            print(f"\n  Saved to {output_path}")

        except Exception as exc:
            print(f"\n  ERROR on {video.name}: {exc}")
            failures.append((video.name, str(exc)))
            # Write a placeholder entry so the file reflects the failure
            entries.append(
                "---\n"
                f"FILE: {video.name}\n"
                "INTERVIEWEE NAME: ERROR\n"
                f"HOOK QUOTE: PROCESSING FAILED — {exc}\n"
                "TIMESTAMP: —\n"
                "WHY IT WORKS: —\n"
                "EDITOR BRIEF:\n"
                "—\n"
                "---\n"
            )

    # Final summary
    print_banner("BATCH COMPLETE")
    print(f"  Processed : {successes} / {len(videos)} videos")
    if failures:
        print(f"  Failed    : {len(failures)}")
        for name, err in failures:
            print(f"    - {name}: {err}")
    print(f"\n  Results saved to: {output_path}\n")


# ---------------------------------------------------------------------------
# Single-file mode
# ---------------------------------------------------------------------------

def run_single(input_str: str) -> None:
    print_banner("HOOK FINDER AGENT — DigiMAIDS")

    with tempfile.TemporaryDirectory() as tmp:
        hook = process_file(input_str, tmp, update_notion_flag=True)

    print_banner("HOOK FOUND")
    print(f'\n  Interviewee : {hook["interviewee_name"]}')
    print(f'  Quote       : "{hook["quote"]}"')
    print(f'  Timestamp   : {hook["timestamp_start"]} - {hook["timestamp_end"]}')
    print(f'\nWHY IT WORKS:\n{hook["why_it_works"]}')
    print("\n--- WHATSAPP BRIEF CARD (copy below this line) ---\n")
    print(hook["brief_card"])
    print("\n" + "-" * 62)
    print("  Brief card ready to copy.")
    print("=" * 62 + "\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="DigiMAIDS Hook Finder — single file or batch folder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "input",
        nargs="?",
        help="Google Drive URL or local file path (single-file mode)",
    )
    parser.add_argument(
        "--batch",
        metavar="FOLDER",
        help="Folder of video files to process (batch mode)",
    )
    parser.add_argument(
        "--output",
        metavar="FILE",
        default="workflows/elevate-interviews-hooks.md",
        help="Output markdown file for batch results "
             "(default: workflows/elevate-interviews-hooks.md)",
    )

    args = parser.parse_args()

    if args.batch:
        run_batch(args.batch, args.output)
    elif args.input:
        run_single(args.input)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
