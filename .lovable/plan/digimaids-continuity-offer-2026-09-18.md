# Fold DigiMAIDS into a Build With Her continuity offer

## Why

Right now `/services` ends with an outbound link: "Only want the
automations, none of the media? That is DigiMAIDS" → `digimaids.com`. The
woman who just paid $3,500+ for an Automation Build is the single best
prospect for an ongoing retainer to maintain and extend it, and today we
hand her to a different brand, a different checkout, and a different
trust relationship to buy that. This plan brings the retainer in-house as
the next step after Automation Build, using the infrastructure already
being built for Stripe and bookings, instead of building a second
integration against a site we don't control.

DigiMAIDS' three tiers (Daily Tidy $497/mo, Deep Clean $997/mo, Full
Estate $2,497/mo) already describe the right ladder of scope. This plan
reuses that ladder, renamed to fit Build With Her's voice, as a
**Care Plan** continuity offer sold and delivered from this site.

## Batch A — the offer

- Add three new entries to `SERVICES` (`src/lib/services.ts`) and the
  `services` DB table: `care-plan-light`, `care-plan-standard`,
  `care-plan-full`, priced and scoped to mirror Daily Tidy / Deep Clean /
  Full Estate. Copy follows the existing service voice (plain, second
  person, no hype).
- Mark them `requires: ["An Automation Build with us already"]` — these
  are not sold cold; they only ever appear as an upsell (Batch C), never
  on the public `/services` grid.
- Decide before writing copy: does the entry tier replace or sit beside
  Daily Tidy, given the build itself already includes what Daily Tidy
  covers? Recommendation: Care Plan tiers describe *maintenance and
  monitoring* of what was built, and Deep Clean / Full Estate equivalents
  add net-new automations quarter over quarter — not a re-sale of the
  build itself.

## Batch B — recurring billing

- Add `createSubscriptionCheckoutSession` to `src/lib/stripe.server.ts`
  alongside the existing one-time `createCheckoutSession` — same
  no-op-until-`STRIPE_SECRET_KEY`-is-set pattern, `mode: "subscription"`,
  one recurring `price_data` line item per tier.
- New table `retainer_subscriptions`: `person_id`, `tier`,
  `stripe_subscription_id`, `stripe_customer_id`, `status` (`active`,
  `past_due`, `canceled`), `started_at`, `current_period_end`. RLS scoped
  to `auth.uid()` via `person_id`, admin read-all through `has_role`.
- Extend `src/routes/webhooks.stripe.ts` (built this pass for one-time
  payments) to also handle `customer.subscription.created/updated/deleted`
  and `invoice.payment_failed`, writing to `retainer_subscriptions`.

## Batch C — the upsell moment

- Mark an Automation Build's completion. `projects` already supports a
  `type` and `stage`/`project_stages`; add `type = 'automation_build'` as
  a project type here rather than a new table, and drive it through the
  same stage machinery the content pipeline uses.
- On `/app` (`app.index.tsx`), once her `automation_build` project's stage
  is `delivered`, show a card: "Keep it running" — the three Care Plan
  tiers, each a straight Stripe Checkout subscription link. No sales
  call required to start one; she can always book a Clarity Call if she
  wants to talk it through first.
- Studio: surface active Care Plan clients as a filter on the Pipeline
  board and on her person page, so a retainer client is visibly different
  from a one-time build client.

## Batch D — retire the outbound link

- Remove the "That is DigiMAIDS" section from `/services` once Batch C is
  live in preview and at least one test subscription round-trips through
  Stripe successfully.
- Decide what DigiMAIDS becomes: a fully separate top-of-funnel brand for
  paid ads / cold audiences who want automation without media (keep it,
  point its own checkout at itself), or fully retired in favor of Care
  Plan. Either way, stop cross-linking it from Build With Her's own money
  pages — the two brands competing for the same warm lead is the actual
  problem, not DigiMAIDS' existence.
- If DigiMAIDS stays as a separate cold-audience brand, update
  `content-agency/shared-knowledge/OFFERS_AND_FUNNELS.md` and
  `PILLARS_AND_CTA.md` so its content pillars are explicitly scoped to
  audiences who have never touched Build With Her, not a catch-all.

## Waiting on you

- A decision on Batch A's scope question (maintenance-only vs. re-sold
  build) before copy gets written.
- The live Stripe account (already needed for Batch C of the earlier
  booking-payments plan) — Care Plan subscriptions use the same key.
- A decision on Batch D: sunset DigiMAIDS as a brand, or keep it as a
  separate cold-traffic funnel.

## Technical notes

- Reuses `stripe.server.ts` from the booking-payments work rather than a
  second payment integration — one Stripe account, one webhook route,
  two session modes (`payment` for bookings, `subscription` for Care
  Plan).
- `retainer_subscriptions` is new; `projects`/`project_stages` are reused,
  not duplicated, for tracking build-to-retainer handoff.
- Verification: a test Automation Build project moved to `delivered`
  shows the upsell card; a test Stripe subscription checkout completes,
  writes a `retainer_subscriptions` row, and shows on the Studio Pipeline
  filtered to Care Plan clients; a cancelled subscription updates status
  via webhook without manual intervention.
