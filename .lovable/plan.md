# Robots.txt: let AI crawlers read the public site, nothing private

## What exists today

`public/robots.txt` is already live on buildwithhermedia.com. It blocks `/login`, `/score/quiz`, `/score/r/`, `/app/`, `/admin/`, `/e/` for the generic `User-agent: *` rule — but the four named AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) sit in their own groups that only say `Allow: /`. A named group overrides the wildcard group, so those four bots bypass the private-page blocks entirely.

## Change

Rewrite `public/robots.txt` (same file, no UI or code changes):

1. Keep the search/social bots (Googlebot, Bingbot, Twitterbot, facebookexternalhit) as they are.
2. Give every named AI crawler the same full rule set: `Allow: /` plus the six private-page `Disallow` rules, so "only the approved pages" applies to them too.
3. Extend the named AI crawler list so each major assistant is covered explicitly and cites your content:
   - GPTBot, OAI-SearchBot, ChatGPT-User (OpenAI / ChatGPT)
   - ClaudeBot, Claude-SearchBot, Claude-User (Anthropic)
   - PerplexityBot, Perplexity-User
   - Google-Extended (Gemini training), Applebot, Applebot-Extended (Apple Intelligence), meta-externalagent (Meta AI)
4. Keep the wildcard `User-agent: *` block and its Disallows unchanged — it backstops any crawler not named.
5. Keep `Sitemap: https://buildwithhermedia.com/sitemap.xml`.

## Verification

- Fetch the live `/robots.txt` after publishing and confirm the Disallow rules appear under the AI crawler groups.
- Confirm `/sitemap.xml` still returns 200.
- No changes to pages, design, or SEO metadata.

## Notes

- Blocking a path in robots.txt tells crawlers not to fetch it; the private pages also carry `noindex` where relevant, so nothing private becomes searchable.
- Search indexing is unaffected: Googlebot and Bingbot keep full access to the public pages.
