# Hormozi Review — Build With Her Media / DigiMAIDS

Applying the $100M Offers / $100M Leads / $100M Money Models checklist to the
actual live funnel and offers in this repo: the Findability Score → Clarity
Call → Strategy Consult → Automation Build / Bootcamp / Podcast ladder on
buildwithhermedia.com (`src/lib/services.ts`, `src/routes/index.tsx`), and the
DigiMAIDS Daily Tidy / Deep Clean / Full Estate retainers
(`content-agency/shared-knowledge/OFFERS_AND_FUNNELS.md`).

**Verdict: Not a no, but not ready to push paid spend at yet.** The front end
(score → free call) is genuinely well built. Three specific gaps below are
what stand between this and a Grand Slam Offer.

---

## $100M Offers

| Check | Verdict | Why |
|---|---|---|
| Offer specific enough? | ✅ BWH · ⚠️ DigiMAIDS | "Findability Score," "Automation Build," "Strategy Consult" are concrete. DigiMAIDS tiers (Daily Tidy/Deep Clean/Full Estate) list feature bundles ("basic social media scheduling," "standard document processing") rather than named outcomes — vaguer than the BWH side. |
| Solves a painful, urgent problem? | ✅ | "Clients cannot pay a business they cannot find" is a sharp, urgent hook. Good. |
| Dream outcome crystal clear? | ✅ BWH · ⚠️ DigiMAIDS | "Get found, booked and paid" is clear. DigiMAIDS's "AI-powered business assistant agency" is generic by comparison. |
| Risk reversed? | ⚠️ | 30-day guarantee + "you own the domain/accounts/data" cover the build. But the **$3,500+ Automation Build has no explicit guarantee on the live pricing page**, and there is currently **zero social proof on the site** — `TestimonialsComingSoon` is a placeholder and the homepage says "Filming starts this autumn." A five-figure-adjacent offer with no case studies and no stated guarantee is the single biggest risk-reversal gap. |
| Would you feel stupid saying no? | ✅ free tier · ❌ paid tier | Free score + free Clarity Call: easy yes. The $3,500 build, cold, with no proof: not yet a "stupid to refuse" offer — that's proof debt, not a pricing problem. |

## $100M Leads

| Check | Verdict | Why |
|---|---|---|
| Know exactly where the customer is? | ✅ | Miami women business owners, street-interview sourcing — specific and personal. |
| Warm before cold? | ✅ | Personal brand + street interviews + Skool is warm-channel-first. Good instinct. |
| Mastering one channel before adding? | ❌ | Counted from `PERSONAL_BRAND_GUIDE.md` + `services.ts`: IG Reels, TikTok, LinkedIn, Carousels, Threads, Email, Skool, **two** podcast formats, plus a second brand (DigiMAIDS) with its own funnel. That's 8+ simultaneous fronts for what reads as a very small team. The FAQ literally has to explain *"What is the difference between this and DigiMAIDS?"* — needing an FAQ to explain your own brand split is itself a signal the positioning isn't settled yet. |
| Content documents results, not opinions? | ⚠️ | Reel titles in `content-agency/content-output/reels/` are hook/opinion-driven ("3 reasons I quit my 9-5…", "the AI strategy nobody is talking about") rather than before/after or client-result driven. Once the podcast produces real client stories, lean the content mix that way — it's the highest-trust format per $100M Leads. |
| Lead magnet delivers value in <10 min? | ✅ | The Findability Score is explicitly "three minutes," free, no account. This is textbook — don't change it. |

## $100M Money Models

| Check | Verdict | Why |
|---|---|---|
| Charging enough? | ⚠️ | Automation Build at "from $3,500" for a 4–6 week build (site + booking + payments + reminders + reviews) is plausible but untested without proof to back it. DigiMAIDS Daily Tidy at $497/mo for 5 bundled automation categories reads underpriced relative to the value claimed — worth testing upward once retention data exists. |
| Retention stronger than acquisition? | ❌ on BWH · ✅ on DigiMAIDS | DigiMAIDS is monthly retainers — good LTV design. **BWH Media has no continuity offer at all** — Clarity Call, Strategy Consult, Automation Build, Bootcamp, and both podcast tiers are all one-time. After a $3,500 build and "one month of support," there is no defined next step. This is the clearest structural gap in the whole model. |
| Know LTV:CAC? | ❓ | No tracking or reporting on this found anywhere in the repo. Can't be scored — needs instrumentation before scaling spend. |
| Optimizing for margin, not just revenue? | ⚠️ | The bundled "one month of support after handover" on Automation Build has no defined boundary or paid extension — support cost is undefined and could quietly erode margin on every build. |
| Simpler or more complex? | ❌ | Tally: 7 BWH offers (clarity call, strategy consult, automation build, bootcamp, podcast-street, podcast-longform, custom) + 3 DigiMAIDS tiers = **10 SKUs across two branded funnels**, run by what appears to be a very small team. Hormozi's money-model bias is toward fewer, more repeatable offers — this is real complexity to watch. |

---

## What's genuinely working (keep this)

- **The score-driven offer router is sharp.** `BAND_FIRST_STEP` in `src/lib/services.ts` routes each Findability Score band to a specific primary/secondary offer — that's a real value-ladder implementation, not just a services page. Most service businesses never build this.
- **Free score → free call → paid depth** is textbook Hormozi sequencing: diagnose free, sell the fix once trust is earned.
- **The 3-minute lead magnet** is exactly the "value in under 10 minutes" the Leads book calls for.
- **Ownership + 30-day guarantee** on the build is real risk reversal, not just a claim.

## The one fix that pays back first

Ship social proof before anything else. Right now the most expensive offer on
the site ($3,500+ Automation Build) sits behind a `TestimonialsComingSoon`
placeholder and a homepage that says filming hasn't started. Get even 2–3
real client quotes or a single filmed case study up before spending on paid
traffic to that page — it directly closes the "would I feel stupid saying no"
gap, and it's cheaper than fixing pricing or channel sprawl.

**After that, in order:**
1. Add one continuity offer to BWH Media (even a light monthly "keep it running" retainer) — closes the Money Models retention gap.
2. Pick one acquisition channel to go all-in on for a quarter before the next one — the current 8-front spread is working against, not for, compounding.
3. Instrument LTV:CAC now, even roughly — you can't raise prices with confidence (Money Models' default bias) without knowing what a client is actually worth.
