# n8n Workflow Audit & Fixes

Audited every n8n workflow in this repo, plus the one live workflow actually
deployed on the connected n8n instance (`digimaids.app.n8n.cloud`), using the
n8n-mcp-skills pack (expression syntax, validation, node configuration, error
handling). This session only has read/execute access to the live instance
(`search_workflows` / `get_workflow_details` / `execute_workflow` — no
create/update/validate tools), so live fixes are exported here as corrected
JSON rather than pushed directly. **You'll need to re-import the fixed files
below into n8n by hand**, or grant this session full n8n-mcp write access so
future fixes can go straight to the instance.

## 🔴 Live and broken right now

### `Build With Her Interviews Tracker Backend` (active, id `mH8zpRSnJNgqszI7`)
Exported and fixed as **`n8n-interviews-tracker-backend.json`** in this folder
(this workflow had no corresponding file in git before — it only existed in
n8n). The `update-interviews` webhook's **"Update a database page"** node was
broken two ways:

1. `pageId` was hardcoded to one specific Notion page URL, so every call to
   `/webhook/update-interviews` — regardless of which interview it was meant
   for — silently updated the *same* record.
2. `propertiesUi.propertyValues` contained `{"key": "={{ $json.body.pageId }}"}`
   plus a stray empty `{}` — not a valid property mapping, so no real field
   was ever set. Combined with (1), this webhook has never correctly updated
   an interview record.

**Fix:** `pageId` now reads `{{ $json.body.pageId }}` from the request (as the
other two webhooks in this workflow already correctly do), and
`propertiesUi.propertyValues` maps the editor/approval/posting/research fields
named in this workflow's own LLM system prompt, each with `ignoreIfEmpty: true`
so a partial update only touches the fields the caller actually sends. A few
property *types* (`Editor Assigned`, `Posted Links`) are my best guess from
the prompt's field list — verify those against the actual Notion database
schema before relying on them.

**Also worth doing on this workflow** (not changed, flagging only): all three
webhooks accept unauthenticated POST requests to a workflow that creates,
reads, and writes a business-critical Notion database — worth adding a shared-secret
header check (same pattern as `build-with-her-emails-n8n-workflow.json`'s
`Verify Signature` node) before this scales.

## 🟠 Real bugs, fixed in the repo's own JSON files

### `build-with-her-emails-n8n-workflow.json` (transactional email for buildwithhermedia.com)
- **Committed fallback secret (security bug).** `Verify Signature` fell back to
  the literal string `'PASTE_N8N_EMAIL_WEBHOOK_SECRET_HERE'` when
  `N8N_EMAIL_WEBHOOK_SECRET` was unset — a secret sitting in git. Anyone could
  forge a valid `X-BWH-Signature` by HMAC-signing with that known string.
  Fixed to fail closed (`valid: false`) when the secret isn't configured.
- Migrated the node from the legacy `n8n-nodes-base.function` (global `items`)
  to `n8n-nodes-base.code` (`$input.first().json`) — the modern, supported API.
- `require('crypto')` is kept (the site's real caller,
  `src/lib/n8n-email.server.ts`, signs with true HMAC-SHA256, so this can't be
  swapped for a plain string compare) — **but this only works if the n8n
  instance has `N8N_RUNNERS_ALLOWED_BUILT_IN_MODULES` (or legacy
  `NODE_FUNCTION_ALLOW_BUILTIN`) including `crypto`.** On a default install
  this throws "Cannot find module 'crypto'" and every email silently fails.
  **Check this env var is set on whichever n8n instance runs this workflow.**
- The `Route by Event` Switch's fallback branch (unrecognized `event` value)
  was wired straight to `Respond Success` — an unknown event type returned
  `{"ok": true}` with no email sent. Added a `Respond Unknown Event` node
  (400) and rewired the fallback to it.
- None of the 7 `Send * Email` nodes had error handling — an SMTP failure
  threw an unhandled 500 instead of the workflow's own `{"ok": false, ...}`
  convention. Added `onError: "continueErrorOutput"` to each and wired their
  error outputs to a new shared `Respond Email Failed` (502) node.

### `content-agency/workflows/n8n-digimaids-daily-pipeline.json`,
### `content-agency/workflows/n8n-editor-brief-sender.json`,
### `content-agency/workflows/n8n-interview-auto-scheduler.json`
All three send WhatsApp notifications via
`https://graph.facebook.com/v19.0/={{ $env.WHATSAPP_PHONE_ID }}/messages`.
**The `=` has to be the first character of the entire field for n8n to
evaluate it as an expression at all** — embedded mid-string like this, the
whole URL is a literal string and `{{ $env.WHATSAPP_PHONE_ID }}` is sent
un-interpolated. Every WhatsApp call in all three workflows was hitting a
literal, broken URL. Fixed to `=https://graph.facebook.com/v19.0/{{ $env.WHATSAPP_PHONE_ID }}/messages`
in all three.

Also fixed in this pass:
- **`n8n-digimaids-daily-pipeline.json`** — `Alert: Pipeline Failed` built its
  WhatsApp body via `bodyParameters` (form-style key/value pairs), which
  can't represent the nested `text: {body: ...}` object the WhatsApp Cloud
  API requires, and it also pointed at a `httpHeaderAuth` credential that was
  never attached. Rewritten to match the working `specifyBody: "json"`
  pattern the other two WhatsApp-sending workflows already use correctly.
- **`n8n-editor-brief-sender.json`** — the webhook node's own notes say
  "POST to `/webhook/send-editor-brief`," but `httpMethod` was never set, so
  it defaulted to GET and silently ignored POSTs. Added `httpMethod: "POST"`.
- **`n8n-interview-pipeline.json`** — the Claude API call requested model
  `claude-opus-4-7`, which isn't a real model id. Updated to `claude-sonnet-5`.

## Not fixed — flagged for a decision, not a bug

- None of the workflows have retry/error branches on their external API calls
  (Whisper, Claude, Notion, WhatsApp) beyond what's listed above — acceptable
  for now given these are low-volume, human-monitored flows, but worth
  revisiting if volume grows (see n8n-error-handling skill).
- Every webhook across all these workflows is unauthenticated. Fine for a
  first-party Lovable→n8n integration with the secret hard to guess, less
  fine as this scales — worth a shared-secret or HMAC check on each.
