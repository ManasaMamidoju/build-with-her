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

## Done (continued)
- Calendly connector linked; booking lookups go through it (personal token still works as fallback)
- Apify and Anthropic keys saved
- Scheduled job every 30 minutes calling /cron/send-bingo-followups (first Beauty Weekend email due Sat 10am ET)
- Published bingo pages and cron endpoint to buildwithhermedia.com

