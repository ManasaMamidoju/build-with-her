# Roadmap

## Done
- Restored the preferred public design (commit 390595e) while keeping external Supabase, auth, admin, and privacy fixes
- Published the restored version to buildwithhermedia.com
- Clean share links: /book/podcast, /book/clarity, /book/strategy redirect correctly
- Fixed /podcast/book and /podcast/apply being swallowed by the podcast page (split into layout + index)
- Browser-tested end to end: podcast booking (public, no sign-in), member clarity-call booking, signed-out redirects, lead score gate; test data removed

## Open
- Google Calendar connection (booking events + Meet links; currently skipped gracefully)
- Stripe payments (strategy consult invoices for now)
- Publish latest fixes so the booking pages work on buildwithhermedia.com
