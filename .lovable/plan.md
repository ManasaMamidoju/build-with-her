# Database cleanup: one canonical person record

Migrations only. The site keeps working exactly as it does today; the app keeps reading
services and band routing from code. No new features.

## What the data looks like right now

- 79 interview rows, none with an email, 73 with an Instagram handle
- 80 profile rows: 79 of them are the imported interview contacts (no email), 1 is a real signed-in account
- 3 score submissions, 2 touchpoints, 73 handles
- bookings, projects, episodes, guest pages, referrals, metrics, deliverables, waitlists, applications, attendees: all empty

So the only real backfill work is the 79 interview women plus a handful of score and
touchpoint rows. Everything else gets its new column and stays empty.

## Step 1 - the `people` table

One row per person, whether or not she has ever given us an email.

Fields: full_name, email (case-insensitive, unique only across rows that have one),
business_name, phone, primary_source, source_detail, industry_id, business_type,
website, city, photo_url, consent_confirmed (+ timestamp), research_status,
research_summary, blocked (+ reason), tags, profile_id (unique, nullable, set when she
signs in), identity_status ('email' | 'handle' | 'name_only'), created_at, updated_at.

Access: only signed-in team roles can read or write; nothing public. Updated-at trigger,
plus indexes on normalized name, email, and profile_id.

## Step 2 - backfill and link

Matching order per source row, run inside the migration:

1. Has an email -> normalize, find or create on email, identity_status 'email'
2. No email but has a handle (instagram / other_links) -> normalize the handle, look it
   up in person_handles; link to that person if found, otherwise create from her name as
   'handle' and record the handle
3. Name only -> create as 'name_only'

If the source row already has profile_id, that profile's email drives the lookup and
people.profile_id is set. Missing emails never fail or skip a row.

Then each of score_submissions, waitlists, podcast_applications, event_attendees,
interviews, touchpoints, person_handles, person_notes gets a nullable
person_id -> people(id).

## Step 3 - manual review queue

A view listing merge candidates, no automatic merging on names:

- same normalized name, different or missing email
- a 'name_only' person whose name closely matches someone who does have an email or
  handle (this is the case that matters)

Exposed on a studio screen as a read-only list with both records side by side and a
"merge these two" action that only runs when clicked. Exact-email duplicates are the
only thing that merges without review.

## Step 4 - point the work tables at people

projects, bookings, episodes, guest_pages, referrals, metrics_entries each gain
person_id alongside the existing profile_id. Nothing is dropped, no existing logic
changes; all of these tables are empty today so there is nothing to backfill.

## Step 5 - missing fields

- deliverables.frameio_url
- deliverable_notes (deliverable_id, author_id, author_role, body, created_at) so admin,
  content manager and editor share one thread; existing team_notes / internal_notes stay
- bookings.google_event_id, bookings.meet_link

## Step 6 - services and band rules as tables

- `services`: slug, name, step, price, price_note, duration, summary, best_for, includes,
  requires, faqs, cta_label, cta_note, waitlist, sort_order, active - seeded with the
  seven offers exactly as they read today
- `band_rules`: band, min score, max score, headline, primary offer, secondary offer -
  seeded from the current band logic

Tables only. The site still reads the code files, so nothing visible changes.

## Step 7 - one people screen

/admin/interviews and /admin/people become a single People screen joined through
person_id, so each woman appears once whichever door she came in by. Her row shows
identity_status as a plain badge (Email on file / Handle only / Name only) and her
interview details open inline. The old interview-only route redirects to the merged
screen.

## Judgment calls I am making

- The 79 imported profiles rows have no email, so they backfill through the handle path.
  Profiles stays as the sign-in record; people becomes the canonical person record.
- Handle normalization: lowercase, strip @, strip instagram.com/ prefixes and trailing
  slashes. other_links is only used when it parses to a recognisable platform handle.
- "Closely matches" for the review queue means same normalized name or a close
  similarity score, surfaced for a human to judge, never acted on automatically.
- Empty tables get columns but no backfill.
- Nothing is dropped anywhere in this pass.

## Deliverables at the end

The migration files, a people count broken down by identity_status, and the list of
judgment calls actually hit while running it.
