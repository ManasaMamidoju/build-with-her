import { createFileRoute } from "@tanstack/react-router";

import { canonical, SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Build With Her Media" },
      {
        name: "description",
        content:
          "The terms that cover scores, bookings, consults, podcast recordings and automation builds with Build With Her Media.",
      },
      { property: "og:title", content: "Terms of Service | Build With Her Media" },
      {
        property: "og:description",
        content: "Terms covering scores, bookings, consults, podcasts and builds.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="container-editorial py-14 md:py-24">
      <p className="eyebrow text-primary">Draft, review before launch</p>
      <h1 className="mt-3">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated September 5, 2026</p>

      <div className="prose-editorial mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-2xl">Who we are</h2>
          <p className="mt-3">
            This site is operated by {SITE.legalName}. Reaching us is easiest at {SITE.email}.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Using your account</h2>
          <p className="mt-3">
            You sign in with Google. Keep your details accurate, and do not share your account with
            anyone else. We may close an account that is used to abuse the service or other women in
            the community.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Your Findability Score</h2>
          <p className="mt-3">
            The score is an assessment based on what you tell us and what we can see publicly. It is
            guidance, not a guarantee of rankings, traffic, leads or revenue.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Calls, consults and recordings</h2>
          <p className="mt-3">
            Free calls can be rescheduled or cancelled once, up to 24 hours before the start time.
            Missing a free call without notice means you cannot book another one. Paid consults and
            podcast recordings are paid before the session and are non-refundable once the session
            begins.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Builds and payments</h2>
          <p className="mt-3">
            Automation builds start after an accepted offer. Invoices are due on the dates shown on
            the invoice. Split payments run through our payment provider. Work pauses while an
            invoice is past due.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Content and ownership</h2>
          <p className="mt-3">
            You keep ownership of your brand, your words and the footage of you. We keep ownership of
            our rubric, templates, systems and site content. When you appear on the podcast you allow
            us to publish and promote the episode and the clips from it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Limits</h2>
          <p className="mt-3">
            We provide the service as it is. We are not liable for lost profits or indirect losses.
            Nothing here removes rights you have under the law where you live.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Changes</h2>
          <p className="mt-3">
            If we change these terms we will post the new date at the top of this page. Continuing to
            use the site means the new terms apply.
          </p>
        </section>
      </div>
    </main>
  );
}
