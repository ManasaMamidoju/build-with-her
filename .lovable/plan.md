# Booking links: test the flow end to end + clean share links

## What exists today

| What | Share link | Sign-in needed |
|---|---|---|
| Podcast street-style | /podcast/book or /book/podcast-street | No |
| Podcast long-form | /book/podcast-longform | No |
| Clarity Call | /book/clarity-call | Yes, plus a Findability Score |
| 2-Hour Strategy Consult | /book/strategy-consult | Yes, plus a Findability Score |

## Plan

### 1. Test the booking flow end to end (browser, on the preview)
- Open /podcast/book, pick both formats, confirm real time slots load from the calendar rules, fill the guest form, and place a test booking. Confirm the "You are booked" screen and that the row lands in the bookings table with the guest details and source.
- Sign in as the test client account, confirm /app/book lists Clarity Call and Strategy Consult, walk through /app/book/clarity-call: answer the intake questions, pick a slot, book, and confirm it appears under "My bookings."
- Try the shareable short links (/book/podcast-street, /book/clarity-call) signed out and confirm they redirect to the right place (sign-in then back to booking for member services).
- Check the lead path: a signed-in lead without a score sees the "Take the Findability Score first" gate instead of slots.
- Clean up any test bookings created during testing so your real calendar stays clear.

### 2. Cleaner share links
- Add short, memorable redirect routes so every link is easy to say out loud and post:
  - /book/podcast → the podcast booking chooser
  - /book/clarity → Clarity Call
  - /book/strategy → 2-Hour Strategy Consult
- Keep the existing /book/$slug links working unchanged.
- Verify each link resolves correctly on the preview before handing them over.

### 3. Hand over the final link list
- A short list of the exact URLs to paste into social bios and posts, with notes on which need sign-in.

## Technical notes
- Redirects are tiny route files under src/routes/book.* following the existing /book/$slug pattern (redirect to /podcast/book or /app/book/$slug).
- Testing uses the existing test accounts; no schema or email changes.
- Test bookings are deleted after verification.
