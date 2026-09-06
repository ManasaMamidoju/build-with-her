# What is still missing

Public pages, the quiz, the member area, booking and the first studio screens are built. Here is what remains, in the order I suggest building it.

## 1. Studio: the rest of your own screens
- **Pipeline board**: every woman as a card in her stage (new, contacted, call booked, proposal, client, past), moved with a click, so you can see the whole month at a glance.
- **Calendar view**: your booked sessions for the week and month, with a click through to the person.
- **Studio settings**:
  - the days, hours, session length, gap between sessions and notice period that decide the times women can pick;
  - the wording of the confirmation, reminder and score emails, editable by you;
  - the industry list and the band wording.
- **Team access**: invite your content manager and editor by their Google email, each seeing only their own area (money pages stay yours alone).

## 2. Studio: events and printable QR codes
- Create and edit events, publish or unpublish them.
- A printable QR poster per event that opens her one-minute sign-in page.
- A download of everyone who signed in at an event, as a spreadsheet.
- Your two seeded events are already there; this gives you the screens to run them.

## 3. Bringing your Notion people in
- Upload a spreadsheet export, see a dry-run report first (new, matched by email, duplicates, missing email), then confirm the import.
- Anyone without an email address gets flagged for you to chase.

## 4. Emails that actually send
- Connect the sending account, verify your sending domain, then switch on: score result, booking confirmation, 24-hour reminder, cancellation, waitlist thank-you.
- The wording is already written and stored; this connects it to real delivery.
- Needs from you: the email account and the domain.

## 5. Taking payment
- Card payment for the paid sessions and podcast packages, receipts on your payments page (which currently teaches an empty state).
- Needs from you: the payment account.

## 6. Launch check
- Spam protection and a submission limit on the quiz, contact and waitlist forms.
- Every page checked for its own title, description and sharing preview; all links clicked; the search-engine files verified.
- Run your own Findability audit against your site and fix anything short of full marks.

## Waiting on you
Domain, email sending domain, card payment account, and the Google sign-in consent screen. Everything else I can build now.

## Technical notes
- New tables: `partners`, `referrals`, `band_rules`, `import_batches` (dry-run staging). Existing `availability_rules`, `email_templates`, `events`, `event_attendees` gain admin write screens.
- Studio routes under `src/routes/_authenticated/admin.*`, all gated server-side through `has_role(auth.uid(),'admin')`; team roles read from `user_roles` (`content_manager`, `editor`).
- All reads and writes through server functions in `src/lib/*.functions.ts`; QR generated client-side from the public `/e/$slug` URL.
- Emails through Resend called from server functions after domain verification; Stripe Checkout added last.
- Each stage verified with a type check, a page fetch and a browser run with two test accounts.
