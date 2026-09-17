# Restore the preferred Build With Her Media version

## Goal
Make `buildwithhermedia.com` use the public-facing design shown in the screenshot and older preview, including:

- Navigation: Score, Services, Podcast, Learn, Events, About, Community
- Separate Sign in or Studio account link
- “Get your Findability Score” action
- The `/score` introduction page headed “Find out where clients lose you.”
- The fuller editorial layouts and copy from that same design pass

## Why two versions appear
The screenshot matches saved design commit `390595e` (“Design and copy pass”). The current project branch later replaced that public navigation, removed `/score`, and simplified many public pages. Publishing deploys the current branch, so republishing alone keeps serving the newer “Home / Ways to work with us / Podcast / Interviews / Learn / Blog / About” version.

## Implementation
1. Restore the preferred public site shell from the matching saved design:
   - Header and mobile menu
   - Footer
   - `/score` landing page and its route
   - Public home, services, podcast, learn, events, about, community, contact, legal, blog, and score presentation where those pages changed in that design pass

2. Reconcile rather than roll back later functional work:
   - Keep the current external database connection and schema
   - Keep Google and email sign-in
   - Keep admin role detection and show **Studio** to admins
   - Keep current interview privacy protections
   - Keep current people, pipeline, booking, score submission, waitlist, and n8n email logic
   - Keep current Studio/admin screens

3. Update generated route references naturally by restoring the `/score` route file; do not edit the generated route tree manually.

4. Verify the preferred version on desktop and mobile:
   - Header labels and score button match the screenshot
   - `/score`, `/learn`, and all restored navigation destinations load
   - Sign in still works as an entry point
   - Admin users still receive the Studio link
   - No public interview contact details are exposed

5. Run the relevant checks, compare the live preview visually with the supplied screenshot, then publish the reconciled version to `buildwithhermedia.com`.

## Scope protection
This is a selective public-site restoration, not a full repository rollback. Newer backend, authentication, security, data cleanup, and Studio work will remain intact.
