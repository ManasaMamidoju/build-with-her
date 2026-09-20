# Stage illustrations, clearer stage copy, and search-engine fixes

## 1. The five rose illustrations

Your five uploaded rose drawings replace the grey "illustration" boxes on the home page stage cards:

- Seed — the closed pod
- Sprout — the two young leaves
- Bud — the rosebud
- Bloom — the open rose
- Garden — the three roses on the vine

They are stored as hosted images (not copied into the code) and used on the home page stage cards and on the Findability Score page, so each stage now shows its own drawing at the same card size as today. Each one gets a written description for screen readers and search engines, for example "A single closed rose pod, the Seed stage".

## 2. Real descriptions for the five stages

Each stage gets its score range and a plain explanation of what that part of the scale means, using the wording already in the scoring logic:

- Seed (0–39): Clients looking for exactly what you sell will not find you yet.
- Sprout (40–54): You exist online, but almost nothing is working to bring you clients.
- Bud (55–69): People do find you. Most of them fall out before they book.
- Bloom (70–84): The basics hold. What is missing is the part that compounds.
- Garden (85–100): Your work keeps returning to you. Now it is about scale and story.

The one-line taglines you have now stay; the range and explanation sit underneath. The same five stages, with their ranges, are also added to the Findability Score page so someone landing there from search understands the scale before starting.

## 3. Search engine fixes (no design changes)

What I found and will fix:

- Two public pages have no title or description at all: Mission and Interviews. Both get their own title, description and social text.
- The Mission, Interviews, Podcast Apply and score result pages are missing the "this is the real address of this page" tag pointing at buildwithhermedia.com. Added everywhere it belongs, on the page itself, one per page.
- Headings: every public page already has exactly one main heading. I will re-check each page and split long stretches of text into proper section headings where a page currently jumps between subjects without one (Mission, Community, Events, Contact).
- Images: the two photos have short descriptions; they get fuller ones, and the new stage drawings get their own.
- Text in the page source: pages are already delivered as finished HTML by the server, so the words are visible to crawlers without JavaScript. I will confirm this by reading the raw page source for each public page and fix any page that comes back empty.
- The sitemap already exists but is missing several live pages (Score, Interviews, Events detail pages, Podcast apply and book). It will list every public page, and hidden pages (sign-in, quiz, private score links, client area, studio) stay excluded.
- robots.txt stays as is; it is already correct and points to the sitemap.

## 4. Google Search Console

I will verify buildwithhermedia.com in Search Console using your connected Google account, then submit the sitemap. This needs the verification tag to be live on the published site, so the sequence is: make the changes above, publish, verify, submit.

## Technical notes

- New `.asset.json` pointers in `src/assets/stages/` for the five illustrations; stage data moves into a small shared list (name, range, tagline, description, image) used by `src/routes/index.tsx` and `src/routes/score.index.tsx`; `ImagePlaceholder` usage removed from the stage cards only.
- Per-route `head()` additions for `mission.tsx` and `interviews.tsx`; canonical links added to `mission.tsx`, `interviews.tsx`, `podcast.apply.tsx`; `score.r.$token.tsx` keeps `noindex` and gets no canonical.
- `src/routes/sitemap[.]xml.ts`: add `/score`, `/interviews`, `/podcast/apply`, `/podcast/book`, and published event pages from the database; no `lastmod` values since there are no reliable per-page content timestamps.
- Search Console: request a META token for `https://buildwithhermedia.com/`, add it to the root route head, publish, verify, add the site, then submit `https://buildwithhermedia.com/sitemap.xml`.
