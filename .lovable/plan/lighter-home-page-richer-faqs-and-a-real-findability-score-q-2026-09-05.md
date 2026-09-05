# Lighter home page, richer FAQs, and a real Findability Score quiz

## What changes on the home page

- The dark opening section becomes light: blush white background, charcoal
  headline, crimson button, with a soft blush panel behind the words so it still
  feels designed rather than plain. The rest of the page keeps alternating
  blush white and pale blush so the whole page reads light top to bottom.
- The five FAQ answers get rewritten longer: each one gives the real detail (what
  the five areas measure, what the score bands mean, what is free and what is
  paid, what arrives in the email, what happens on the clarity call). Two more
  questions are added: what she gets in the email, and what happens to her
  information.
- Every "Get your Findability Score" button on the page, in the header, and in
  the bar at the bottom of the phone screen goes to the quiz, not to sign-in.

## Navigation and footer

- Top navigation becomes: Home, Take the quiz, Sign in. Terms and Privacy come
  out of the top and live only in the footer, which already lists them.
- Footer gains the quiz link next to Home and Sign in.

## The quiz and the guest profile

The full five-area score, no account needed.

- **The quiz** at `/score/quiz`: about 22 questions grouped into the five areas
  (where you show up, how clear your offer is, what pulls people in, how they
  book you, what keeps you growing). One area per screen, a progress bar, answers
  kept if she refreshes, and plain-language options rather than jargon.
- **Her details** on the last screen: name, email, business name, website or
  social handle, optional phone. Email is required because that is where the
  score goes.
- **Her result** at `/score/r/<her private link>`: her number out of 100, her
  band, a bar for each of the five areas, the three fixes to do first written for
  her answers, and one clear next step which is booking the free clarity call.
  The link is long and unguessable, and it is hers to keep, so she can come back
  to it any time. This is the guest profile: score details, her fixes, and the
  offers that match her band.
- **The email**: the page shows her result immediately and shows the link to save.
  Sending it to her inbox needs the email service, which is a later step in the
  plan, so for now the link is displayed and copyable and the page says the email
  is on its way once sending is live. Nothing is faked.
- **Signing up** stays where you wanted it: after the clarity call. Nothing in
  this flow asks her to create an account.

## Scoring

The five areas total 100 points: where you show up 25, clarity 20, what pulls
people in 25, how they book 15, what keeps you growing 15. Bands: under 40
Undiscoverable, 40 to 54 Invisible with a pulse, 55 to 69 Leaky, 70 to 84 Solid,
85 to 100 Compounding. The three fixes are the three lowest-scoring questions
that carry the most weight, each written as one concrete action.

## Technical notes

- New tables: `score_submissions` (id, public token, name, email, business, site,
  phone, source, answers jsonb, area scores, total, band, created_at) and
  nothing else. RLS on, no anon select; reads and writes go through server
  functions so the token is the only key, and the row is later linkable to a
  member by email once she signs up after her call. GRANTs to `service_role`
  only, plus `authenticated` select for her own row by email.
- Two server functions in `src/lib/score.functions.ts`: `submitScore` (zod
  validated, scores server-side, returns the token) and `getScoreByToken`.
  Scoring lives server-side so the rubric is not shipped to the browser.
- Rubric and question copy in `src/lib/score-rubric.ts`; question text is public,
  point weights stay server-only.
- Routes: `src/routes/score.quiz.tsx`, `src/routes/score.r.$token.tsx`, both with
  their own head metadata, the quiz and result set to noindex, and the result
  loaded through the server function.
- `public/robots.txt` and the sitemap updated for the new pages.
