# Roadmap

## Done
- Foundation, theme, sign-in, legal pages, SEO scaffolding
- Findability Score quiz, private result page, source capture, touchpoints
- Member area: dashboard, score, settings, billing empty state, booking flow
- Public pages: about, mission, podcast, learn index + 5 explainers, community, contact, events, event sign-in
- Studio area: today view, people list, person 360 with notes and stage
- sitemap.xml route and robots rules

- Studio pipeline board, week calendar, studio settings (hours, email wording, industries, team)
- Studio events screen with printable sign-in code and spreadsheet download
- People import from a spreadsheet export with a dry run
- Spam protection on the public forms
- Manasa's account can open the studio

- Podcast guest application form, studio podcast pipeline
- Projects: steps, deliverables, editor queue, her approval view
- Sprint A: bootcamp waitlist, canonical person linking, band-aware first offer, and service Q&A markup

## Next
- Sprint A email automations through n8n: score result and waitlist confirmation
- Later email automations through n8n: booking confirmations and reminders
- Payments with Stripe
- Full site audit: link check, SEO pass

## Answered
- Backend is already enabled on this project (Lovable Cloud); nothing to switch on.

## Database cleanup (done)
- people table is the one canonical person record; all sources backfilled and linked by person_id
- placeholder profiles from the interview import removed; profiles now only for people who signed in
- duplicate review queue at /admin/duplicates, manual merge only
- services and band_rules tables seeded; app still reads the code files (switch later)
- pipeline and lead stages now use canonical people records; profiles keeps its old field temporarily for compatibility
- next: move remaining signed-in-account lookups off profiles where the work belongs to a person
