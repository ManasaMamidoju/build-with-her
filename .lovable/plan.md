# Build the rest of the platform

Phase 1 of your plan, continued. Each batch below is one reviewable chunk. Booking payments, email sending and SMS stay as clearly labelled placeholders until you hand over the accounts for Stripe, Resend and your calendar.

## Batch A — waitlist and services polish
- Service waitlist form on the bootcamp page saving name, email, phone, business and a note, with a friendly thank-you state.
- Band-aware call to action: a woman who has a score sees the offer that matches her band first.
- Question-and-answer blocks on each service page, marked up so search engines and AI assistants can quote them.

## Batch B — her private area
- `/app` home: her score card, one clear next step, upcoming sessions, links to the community and tutorials.
- `/app/score`: her latest score, the five areas, her three fixes, and history once she retakes it.
- `/app/settings`: name, business, industry, phone, social handles, email and text opt-ins, and delete my account.
- `/app/billing`: read-only list with a teaching empty state.
- She only ever sees her own records. Verified with two separate test accounts.

## Batch C — booking (visible flow, placeholder confirmations)
- `/app/book` and a page per service, with the intake questions from your flow document.
- Available times shown from rules you set (days, hours, session length, buffer, notice).
- A booking is saved, shown on her dashboard, and can be moved or cancelled once up to 24 hours before.
- Confirmation and reminder wording written and stored, sending switched on when the email account is connected. Real calendar sync and card payment come after you connect those accounts.

## Batch D — your admin area
- Role-aware landing: you see admin, your content manager and editor see only their own areas.
- Today view: today's sessions, new scores, new people.
- People list with filters (where they came from, industry, band, stage, tags, event) and a full person page: timeline, handles, consent, notes, merge duplicates.
- Simple pipeline board, calendar view, and settings for team invites by Google email, industries and band wording.
- A content manager cannot open money pages; an editor sees only deliverables.

## Batch E — events and QR sign-in
- Events you can create and edit, each with a printable QR code.
- `/e/[slug]`: sign in with Google, two questions, opt-ins, done in under a minute, and she is recorded as coming from that event.
- Public events page with proper event markup, plus a spreadsheet export.
- Seeded: Miami Beauty Weekend (Sept 26) and eMerge (Oct 18).

## Batch F — remaining public pages
- About, Contact, Community, Mission (short holding page), Podcast (grid with empty state, prices, apply button), and Learn with five SCALE explainer articles.
- Every page gets its own title, description, sharing preview and structured data; copy follows your rules.

## Batch G — bringing your Notion people in
- Import from a spreadsheet export with a dry run report first, duplicates matched by email, and anyone without an email flagged so you can chase it.

## Batch H — launch checklist
- Sitemap and robots verified, form rate limiting and spam protection, all page titles checked, and the Findability audit run on your own site with anything under full marks fixed.
- Left for you to hand over: domain, email sending domain, live card payments, Google sign-in consent screen.

## Technical notes
- New tables: `person_handles`, `partners`, `referrals`, `band_rules`, `services`, `waitlists` (exists), `availability_rules`, `bookings`, `events`, `event_attendees`, `notes`, `tags`. Each gets grants, RLS scoped to `auth.uid()`, and admin access through `has_role`.
- Protected pages live under `src/routes/_authenticated/`; admin pages gate on `has_role(auth.uid(),'admin')` server-side, never in the browser.
- All reads and writes go through TanStack server functions in `src/lib/*.functions.ts`; scoring, availability and role checks stay server-side.
- Email templates stored as data now, sent through Resend once the domain is verified; Stripe Checkout added in Batch C only after keys exist.
- Verification each batch: type check, page fetch, and a browser run of the flow with two test accounts.
