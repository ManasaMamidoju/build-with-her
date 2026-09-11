# Sprint plan vs. the site as it stands

I compared your sprint document against the live site. Here is the honest read.

## Already built (Phase 1, and a good chunk of Phase 2)

- Foundation: theme, layout, Google sign-in, people records, roles, Terms, Privacy, search-engine files, sitemap.
- Findability Score: quiz, scoring, private result page, band routing, where each visitor came from.
- Services: the ladder page, a page per service, band-aware first step, bootcamp waitlist form.
- Her private area: dashboard, her score, settings, payments page (teaching empty state), booking flow with intake and times.
- Your studio: today view, people list with search, full person page with notes and stage, pipeline board, week calendar, settings (hours, email wording, industries, team).
- Events: create and edit, printable sign-in code, her one-minute sign-in page, spreadsheet download, public events page.
- Bringing your Notion people in, with a dry run first.
- Interview tracker (79 women) plus the public interviews page.
- Podcast: application form, studio pipeline, projects with steps and deliverables, editor queue, her approval and changes view.

So Sprints 0-3 in your document are essentially complete, and Sprint 4 and half of Sprint 5 landed early.

## Missing, in the order I would build it

1. **Emails that actually send.** The wording is written and stored, nothing leaves the building yet. Needed: score result, booking confirmation, 24-hour reminder, cancellation, waitlist thank-you. Waiting on your sending account and domain.
2. **Taking payment.** No card payment anywhere: paid sessions, the $200 consult, podcast packages, and receipts on her payments page. Waiting on your payment account.
3. **Real calendar times.** Times come from the rules you set in studio settings, not from your actual Google calendars, so double-booking is possible. Your document already suggests one calendar first, the second later.
4. **Public episode and guest pages.** The tables exist, the pages do not. Each interview should have its own shareable page with a proper sharing preview.
5. **Reminder and no-show handling.** No automatic reminders, and nothing stops a repeat no-show from rebooking.
6. **Money screens.** Custom offers, invoices, and your partner and referral tracking have tables but no screens.
7. **Content track.** Articles, the content calendar, the approval ladder and the n8n hooks.
8. **Growth screens.** Metrics dashboard, daily digest, newsletter.
9. **Launch check.** Link check, every page's title and sharing preview, your own Findability audit run against the site.

## What your document listed but I would not build now

SMS, auto-posting, the tech role, Skool membership and the network directory are Phase 3 in your own plan. Leave them.

## Technical notes

- Emails: Resend called from server functions, reading `email_templates`; a `/api/public/cron/reminders` route for the 24-hour reminder.
- Payments: Stripe Checkout via server functions plus a signature-verified webhook under `src/routes/api/public/`; an `invoices` table.
- Calendar: Google Calendar OAuth with refresh tokens stored server-side, merged against `availability_rules` in `booking.functions.ts`.
- Episode/guest pages: `src/routes/episodes.$slug.tsx` and `src/routes/guests.$slug.tsx` reading `episodes` and `guest_pages`, public-read policies only for `is_public`, with schema markup and sitemap entries.
- Metrics read `metrics_entries`; partners and referrals get studio screens gated on `has_role(auth.uid(),'admin')`.
