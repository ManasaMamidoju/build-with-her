import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/site/LegalLayout";
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

const sections = [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: <p>Reaching us is easiest at {SITE.email}.</p>,
  },
  {
    id: "your-account",
    heading: "Using your account",
    body: (
      <p>
        You sign in with Google. Keep your details accurate, and do not share your account with
        anyone else. We may close an account that is used to abuse the service or other women in the
        community.
      </p>
    ),
  },
  {
    id: "score",
    heading: "Your Findability Score",
    body: (
      <p>
        The score is an assessment based on what you tell us and what we can see publicly. It is
        guidance, not a guarantee of rankings, traffic, leads or revenue.
      </p>
    ),
  },
  {
    id: "calls",
    heading: "Calls, consults and recordings",
    body: (
      <p>
        Free calls can be rescheduled or cancelled once, up to 24 hours before the start time.
        Missing a free call without notice means you cannot book another one. Paid consults and
        podcast recordings are paid before the session and are non-refundable once the session
        begins.
      </p>
    ),
  },
  {
    id: "builds",
    heading: "Builds and payments",
    body: (
      <p>
        Automation builds start after an accepted offer. Invoices are due on the dates shown on the
        invoice. Split payments run through our payment provider. Work pauses while an invoice is
        past due.
      </p>
    ),
  },
  {
    id: "content",
    heading: "Content and ownership",
    body: (
      <p>
        You keep ownership of your brand, your words and the footage of you. We keep ownership of
        our rubric, templates, systems and site content. When you appear on the podcast you allow us
        to publish and promote the episode and the clips from it.
      </p>
    ),
  },
  {
    id: "limits",
    heading: "Limits",
    body: (
      <p>
        We provide the service as it is. We are not liable for lost profits or indirect losses.
        Nothing here removes rights you have under the law where you live.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes",
    body: (
      <p>
        If we change these terms we will post the new date at the top of this page. Continuing to
        use the site means the new terms apply.
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="September 5, 2026"
      intro="These terms cover your Findability Score, your bookings, and any work we build for you."
      sections={sections}
    />
  );
}
