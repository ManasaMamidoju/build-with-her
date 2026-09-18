# Connecting Build With Her Emails in n8n

The app already calls out to n8n for every transactional email (score
result, waitlist confirm, booking confirmation/reminder/reschedule/
cancelled, admin notify) — see `src/lib/n8n-email.server.ts`. It no-ops
quietly until two environment variables are set, so nothing breaks while
this is being wired up.

## 1. Import the workflow

1. In n8n: **Workflows → Import from File** → pick `build-with-her-emails-n8n-workflow.json` from this repo.
2. Open the **Verify Signature** node and replace `PASTE_N8N_EMAIL_WEBHOOK_SECRET_HERE`
   with a real secret (generate one with `openssl rand -hex 32`). This must be
   the *exact same value* you put in the app's `N8N_EMAIL_WEBHOOK_SECRET`.
3. On each of the seven **Send … Email** nodes (they're Gmail nodes), open the
   node and pick your Gmail credential under **Credentials** — connect the
   `hello@buildwithhermedia.com` inbox (not a personal or DigiMAIDS Gmail),
   so replies land somewhere Manasa actually reads.
4. **Activate** the workflow (toggle top-right). Copy the webhook's **Production URL**
   from the Webhook node — it ends in `/webhook/build-with-her-emails`.

## 2. Set the app's environment variables

Wherever this app is deployed (Lovable Cloud env vars):

- `N8N_EMAIL_WEBHOOK_URL` = the production webhook URL from step 1.4
- `N8N_EMAIL_WEBHOOK_SECRET` = the same secret you pasted into the Verify Signature node

No redeploy of the workflow is needed if you rotate the secret later — just
update it in both places at once.

## 3. Test each event

Trigger one of each from the live site (or from a preview deploy) and confirm
the email lands:

- Take the Findability Score → `score_result`
- Join the Bootcamp waitlist → `waitlist_confirm`
- Book a Clarity Call or podcast slot → `booking_confirmation` + `booking_admin_notify` (to `hello@buildwithhermedia.com`)
- Reschedule / cancel a booking → `booking_reschedule` / `booking_cancelled`
- Wait for the reminder cron (or call `/cron/send-booking-reminders` directly) → `booking_reminder`

Each request carries an `Idempotency-Key` header (one per source record and
template) — if the app retries a failed submission, n8n will see the same
key. The current workflow doesn't dedupe on it yet; if you start seeing
duplicate sends on retries, add a Postgres/Redis "seen keys" check before
the Gmail nodes, keyed on that header.

## What was wrong before this pass

The imported JSON in this repo had the emails going through the generic SMTP
**Send Email** node with `fromEmail: info@digimaids.com` on every single
template — meaning even Build With Her's own confirmation/reminder emails
would have shipped from the wrong brand's address. That's fixed: all seven
send nodes are now Gmail nodes (per your call to use Gmail rather than raw
SMTP) with no hardcoded from-address — whichever Gmail inbox you connect in
step 1.3 is what recipients see.
