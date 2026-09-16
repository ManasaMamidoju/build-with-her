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
- Owner Google sign-in verified; account, profile, admin role, and canonical person link confirmed in the external database
- Lint, prettier and type cleanup across the whole app; CI runs typecheck + lint on every push
- Pricing gated to clients only: the 'client' app_role is granted automatically when a person's
  pipeline stage reaches 'client'; everyone else sees where pricing comes from, not a number
- Clarity Call / strategy consult booking now requires a completed Findability Score
- Public, no-sign-in podcast guest booking at /podcast/book, sharing the same calendar engine
- /blog: search, sort (recent / most viewed / A-Z), 5 opinion posts, view tracking, per-post SEO + JSON-LD
- Testimonials-coming-soon placeholder on the homepage and services page
- llms.txt fleshed out with the full page list and the pricing-gating note

## Next

- Sprint A email automations through n8n: app triggers complete; reconnect n8n to create and verify workflows
- Later email automations through n8n: booking confirmations and reminders
- Payments with Stripe
- Real client testimonials once the first ones come in
- Full site audit: link check, deeper SEO pass

## Answered

- Backend is enabled and the app is connected to the owner's external database; the public data API is responding successfully.

## Database cleanup (done)

- people table is the one canonical person record; all sources backfilled and linked by person_id
- placeholder profiles from the interview import removed; profiles now only for people who signed in
- duplicate review queue at /admin/duplicates, manual merge only
- services and band_rules tables seeded; app still reads the code files (switch later)
- pipeline and lead stages now use canonical people records; profiles keeps its old field temporarily for compatibility
- next: move remaining signed-in-account lookups off profiles where the work belongs to a person

- App now runs entirely on the owner's external database: browser and server access are pointed there, Google sign-in works, and the owner account has admin access.
