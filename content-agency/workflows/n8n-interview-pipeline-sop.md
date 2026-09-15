# BWH Interview Pipeline — SOP

Automates the full post-interview workflow: Google Drive folder → pick file by index → ffmpeg audio extraction → Whisper transcription → Claude hook extraction → Notion update → WhatsApp brief card.

**Folder hardcoded:** `123Yn9N4F0v15L4IIQWYA6mNS-Tcm8iHW`
To switch folders later, open the **Google Drive — List Folder** node and update the Folder ID value.

---

## Important: n8n Cloud vs Self-Hosted

This pipeline includes an **ffmpeg audio extraction step** (nodes 3–5) that runs a shell command on the n8n server. This **requires self-hosted n8n** — the Execute Command node is disabled on n8n.cloud for security reasons, and ffmpeg is not installed there.

| Setup | Nodes 3–5 (ffmpeg) | Works? |
|-------|-------------------|--------|
| **Self-hosted n8n on your Windows machine** (recommended) | Runs ffmpeg locally | ✅ Full pipeline |
| **n8n.cloud** | Execute Command blocked | ❌ |
| **n8n.cloud with pre-extracted MP3** | Skip nodes 3–5, upload MP3 to Drive instead | ✅ Partial (see workaround below) |

### Quickest workaround for n8n.cloud

Extract audio locally before uploading, then skip the ffmpeg nodes:
1. Install ffmpeg on Windows: `winget install ffmpeg`
2. Run locally: `ffmpeg -i interview.mp4 -vn -acodec libmp3lame -ar 16000 -ac 1 -b:a 64k interview.mp3`
3. Upload the MP3 to Google Drive
4. In the workflow: delete nodes 3, 4, and 5 (Write Video to Temp, ffmpeg — Extract Audio, Read MP3 from Temp) and connect **Google Drive — Download Video** directly to **OpenAI Whisper — Transcribe**
5. Trigger with the MP3 file ID instead of the MP4

---

## Prerequisites

- **Google Drive** — file must be shared with your n8n Google account, or the Drive is owned by that account
- **OpenAI** — any paid plan (Whisper API access)
- **Anthropic** — Claude API key (console.anthropic.com)
- **Notion** — Internal Integration token with access to your BWH Interviews database
- **Meta WhatsApp Business** — Cloud API with a verified phone number
- **ffmpeg** — installed on the machine running n8n (for self-hosted path)

Install ffmpeg on the n8n server:
- **Windows:** `winget install ffmpeg` or download from ffmpeg.org
- **Linux/Docker:** `apt-get install ffmpeg`

---

## How to Import

1. Open your n8n instance in the browser
2. Go to **Workflows** → **Import from File** (top right)
3. Select `workflows/n8n-interview-pipeline.json`
4. The workflow opens in edit mode — do NOT activate yet
5. Set up all credentials (next section), then activate

---

## Credential Setup (5 required)

### 1. Google Drive OAuth2
Used by: **Google Drive — Download Video**

In n8n → Credentials → New → **Google Drive OAuth2 API**:
- Name: `Google Drive OAuth2`
- Follow the OAuth flow to connect your Google account
- The account must have access to the Drive folder where videos are stored

### 2. OpenAI API Key
Used by: **OpenAI Whisper — Transcribe**

In n8n → Credentials → New → **Header Auth**:
- Name: `OpenAI API Key`
- Header Name: `Authorization`
- Header Value: `Bearer sk-YOUR-OPENAI-KEY`

### 3. Anthropic API Key
Used by: **Claude — Extract Hook**

In n8n → Credentials → New → **Header Auth**:
- Name: `Anthropic API Key`
- Header Name: `x-api-key`
- Header Value: `sk-ant-YOUR-ANTHROPIC-KEY`

### 4. Notion API
Used by: **Notion — Update Interview Row**

In n8n → Credentials → New → **Notion API**:
- Name: `Notion API`
- API Key: your Internal Integration token (notion.so/my-integrations)

Add the integration to your BWH Interviews database: open the database in Notion → Share → Invite your integration.

### 5. WhatsApp Bearer Token
Used by: **WhatsApp — Send Brief Card**

In n8n → Credentials → New → **HTTP Bearer Token**:
- Name: `WhatsApp Bearer Token`
- Token: your Meta WhatsApp Cloud API permanent access token

After creating each credential, open the matching node, click the credential dropdown, and select the one you created.

---

## Webhook Payload Format

Trigger the pipeline by sending a POST to:
```
https://YOUR-N8N-URL/webhook/bwh-interview
```

Required JSON body:
```json
{
  "file_index": 0,
  "notion_page_id": "abc123def456ghi789...",
  "recipient_phone": "15551234567",
  "whatsapp_phone_number_id": "123456789012345"
}
```

| Field | Description |
|-------|-------------|
| `file_index` | 0-based position of the video to process from the folder (0 = first file, 1 = second, etc.). Defaults to `0` if omitted. |
| `notion_page_id` | Open the Notion page → copy the 32-character ID from the URL (after the last `/`, before any `?`) |
| `recipient_phone` | Digits only, no `+` or spaces — e.g. `15551234567` for a US number |
| `whatsapp_phone_number_id` | Meta Developer Console → WhatsApp → API Setup → Phone Number ID |

You no longer need to pass a file ID — the workflow lists your Elevate 2026 folder automatically and picks by position.

---

## Node-by-Node Explanation

### 1. Webhook — Trigger
Listens for POST requests at `/webhook/bwh-interview`. Returns 200 immediately so the caller doesn't wait — the pipeline runs asynchronously. Payload fields are available to all downstream nodes via `$node["Webhook — Trigger"].json.body.*`.

### 2. Google Drive — List Folder
Lists all video files in your Elevate 2026 Interviews folder (`123Yn9N4F0v15L4IIQWYA6mNS-Tcm8iHW`) using a `mimeType contains 'video/'` filter. Returns one item per video file with its ID, name, and metadata. This step runs on every trigger and takes ~1s.

### 3. Pick File by Index
Code node that selects the video at position `file_index` from the folder listing. Throws a clear error if the index is out of range. Outputs `file_id`, `file_name`, `file_ext`, and `total_files` — the rest of the pipeline uses these instead of a hardcoded file ID.

### 4. Google Drive — Download Video
Downloads the selected video file using OAuth2. Outputs the file as binary data in the `data` property. The file stays in n8n's memory pipeline — not written to disk yet.

### 3. Write Video to Temp
Writes the video binary to the n8n server's filesystem at a path like `/tmp/bwh_{fileId}_in.mp4`. The file ID from the webhook is used in the filename so concurrent runs don't overwrite each other. After this node the binary data is no longer in the pipeline — ffmpeg will read from disk directly.

**Windows path:** If running n8n on Windows locally, open this node and change `/tmp/` to `C:\\Windows\\Temp\\` in the fileName expression.

### 4. ffmpeg — Extract Audio
Runs ffmpeg via shell command to strip the video track and compress the audio to MP3:
```
ffmpeg -y -i /tmp/bwh_{fileId}_in.mp4 -vn -acodec libmp3lame -ar 16000 -ac 1 -b:a 64k /tmp/bwh_{fileId}_out.mp3
```

Flags explained:
- `-vn` — remove video track
- `-acodec libmp3lame` — MP3 encoding
- `-ar 16000` — 16kHz sample rate (Whisper's native rate, no upsampling needed)
- `-ac 1` — mono (halves file size vs stereo)
- `-b:a 64k` — 64kbps bitrate (excellent for speech, ~14MB for a 30-min interview)

A typical 10-minute interview produces an MP3 under 5MB — well within Whisper's 25MB limit.

**Requires:** Execute Command node enabled + ffmpeg installed on the n8n server.

### 5. Read MP3 from Temp
Reads the compressed MP3 back from the filesystem into n8n's binary pipeline as the `data` property. This feeds directly into Whisper in the next node.

### 6. OpenAI Whisper — Transcribe
Sends the MP3 as a multipart form upload to OpenAI's Whisper API. Uses `response_format: verbose_json` which returns per-segment timestamps — these are what power the `[MM:SS]` markers in the next step.

### 7. Format Transcript
Converts Whisper's segments array into readable timestamped lines:
```
[00:12] So I walked away from my corporate job and just started...
[00:41] Nobody believed in me, not even my family at first.
```
Outputs: `transcript`, `duration`, `language`, `segment_count`.

### 8. Claude — Extract Hook
Posts the formatted transcript to Anthropic's claude-opus-4-7. The prompt finds the single most surprising or relatable quote and returns structured JSON. Claude is instructed to return plain JSON only — no markdown fences — for reliable parsing.

### 9. Parse Claude Response
Safely parses Claude's API response. Strips code fences if Claude adds them. Falls back gracefully if parsing fails — outputs raw text with a "Manual review needed" flag rather than crashing the workflow. Outputs: `hook_quote`, `timestamp_start`, `timestamp_end`, `why_it_works`, `editor_brief_card`.

### 10. Notion — Update Interview Row
Updates the existing BWH Interviews page using the `notion_page_id` from the original webhook. Sets:
- **Hook Quote** — the extracted quote
- **Hook Timestamp** — e.g. `00:12 – 00:41`
- **AI Brief Sent** — checked ✓

The Notion row must already exist before triggering. Property names must match exactly — update them in the node if yours differ.

### 11. WhatsApp — Send Brief Card
Sends the `editor_brief_card` text to the recipient via Meta's WhatsApp Cloud API. The sender phone number ID and recipient number come from the webhook payload, so they can vary per call.

---

## Testing

### Step 1 — Prepare a test file
Upload one of your interview MP4s to Google Drive. Copy its file ID from the URL.

### Step 2 — Create a test Notion row
Add a row to your BWH Interviews database. Copy the page ID.

### Step 3 — Open the workflow in n8n
Click the Webhook node → click **Listen for test event** → it's now waiting.

### Step 4 — Send the test POST (PowerShell)
```powershell
$body = @{
  file_index               = 0
  notion_page_id           = "YOUR_NOTION_PAGE_ID"
  recipient_phone          = "YOUR_PHONE_NUMBER"
  whatsapp_phone_number_id = "YOUR_WA_PHONE_NUMBER_ID"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "https://YOUR-N8N-URL/webhook-test/bwh-interview" `
  -Body $body `
  -ContentType "application/json"
```

Note: use `/webhook-test/` (with `-test`) while the workflow is in test mode. Use `/webhook/` (without `-test`) after activating.

### Step 5 — Watch execution
n8n → Executions — click the running execution to see each node's input/output live.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Webhook 404 | Test URL used but workflow not in listen mode | Open workflow, click Webhook node → Listen for test event |
| Google Drive list returns 0 files | Folder filter not matching or wrong folder ID | Open the **Google Drive — List Folder** node and confirm the Folder ID is `123Yn9N4F0v15L4IIQWYA6mNS-Tcm8iHW`; also check the mimeType filter |
| Google Drive download fails 403 | Folder not shared with the n8n Google account | Share the Elevate 2026 folder with the Google account used in the OAuth credential |
| file_index out of range error | Index higher than number of files in folder | Send `file_index: 0` to process the first file; the error message tells you how many files are in the folder |
| Write Video to Temp fails | Path doesn't exist or no write permission | On Windows n8n: change `/tmp/` to `C:\\Windows\\Temp\\` in the fileName expression |
| Execute Command not found | n8n.cloud or Execute Command disabled | Must use self-hosted n8n — see workaround at top of this doc |
| ffmpeg not found | ffmpeg not installed | `winget install ffmpeg` (Windows) or `apt-get install ffmpeg` (Linux) |
| ffmpeg fails with error | Wrong input format or corrupt file | Check the Execute Command node's stderr output in the execution log |
| MP3 still over 25MB | Very long recording | Lower bitrate: change `-b:a 64k` to `-b:a 32k` in the ffmpeg command |
| Whisper 401 | Wrong OpenAI credential format | Confirm header is `Authorization: Bearer sk-...` |
| Claude 401 | Wrong Anthropic credential | Confirm header name is `x-api-key` (lowercase, no spaces) |
| Parse node falls back | Claude returned markdown-wrapped JSON | Usually self-correcting; check execution log for the raw response |
| Notion update fails 404 | Wrong page ID | Page ID is 32 hex chars from the Notion URL — no dashes needed |
| Notion update fails 400 | Property names don't match | Open the Notion node and update `Hook Quote`, `Hook Timestamp`, `AI Brief Sent` to match your actual database column names |
| WhatsApp 400 | Phone format wrong | `recipient_phone` must be digits only, no `+` or dashes |
| WhatsApp 401 | Access token expired | Generate a new permanent token from Meta Developer Console |
