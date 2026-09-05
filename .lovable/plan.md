# Build With Her Media — Step 1: Foundation, theme, sign-in

Following your implementation plan step by step. This first pass covers Step 1 (foundation and theme) plus the small Step 2 SEO scaffolding, because on this stack the two go together. Booking, payments and email come later, as you chose.

## What you get in this pass

- The brand look and feel from your design brief: crimson, rose, blush and charcoal palette, Cormorant Garamond headings, DM Sans body, editorial spacing, rose motif used sparingly, band colors for the score levels.
- Site shell: header with navigation, a sticky "Get your Findability Score" bar on phones, footer with community and legal links.
- Home page in place of the placeholder start page: dark hero with one line on what this is and who it is for, one primary button, the three doors as large cards, "How the score works" in three steps, a spot for latest episodes, and an FAQ.
- Sign in with Google, and a member record created automatically on first sign-in with the role "client".
- Terms, Privacy (draft copy you can replace), a sign-in page, and a friendly 404.
- Search engine and social basics on every public page: unique title, description, canonical link, sharing cards, structured data for the business and site, robots and llms files, and a sitemap.

## Accounts and data

Sign-in and member records need the built-in Lovable Cloud backend, so I will turn that on in this step. It gives login, database and file storage with no outside accounts. Table for member profiles with a role for each person (visitor, client, network member, content manager, editor, admin), roles kept in their own table so they cannot be tampered with from the browser, and access rules so a person only ever reads her own row.

## Things I am adapting from your docs

- This project runs on TanStack Start rather than React Router. Pages are already delivered as real HTML to search engines, so the prerender requirement in your notes is satisfied without extra work. The route list from your flow document stays exactly as written.
- Server-side logic will live in this app's own server functions instead of separate Cloud functions. Same behavior, fewer moving parts. Outside services that call in later (Stripe, n8n) get dedicated public endpoints.
- Copy rules from your PRD are applied: no em dashes, "women" never "ladies", buttons name the action, empty states teach.

## Technical notes

- Tokens added to `src/styles.css` as oklch values mapped to Tailwind utilities; fonts loaded via a link tag in `src/routes/__root.tsx`.
- Routes created: `/`, `/login`, `/terms`, `/privacy`, and the shared 404 in `__root.tsx`. Header links only point at routes that exist in this step.
- Components: `Seo`-style `head()` per route plus JSON-LD helpers (Organization, WebSite) in `src/components/seo/`.
- Cloud: `profiles` table with trigger on new auth user, separate `user_roles` table with `app_role` enum and a `has_role()` security-definer function, explicit grants, RLS on both.
- `public/robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended; `public/llms.txt` added; sitemap served from a route.

## Done when

- Signing in with Google creates a profile with role client and lands on the home page.
- The theme renders on Home, Login, Terms, Privacy and 404.
- Each public page returns its own title, description, canonical and structured data in the raw HTML.

## Next steps after your review

Step 3 (people records, industries, touchpoints, source capture from `?src=` and `?ref=`), then Step 4 (Findability Score quiz, scoring, result page and band routing).
