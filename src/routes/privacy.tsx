import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/site/LegalLayout";
import { canonical, SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | Build With Her Media" },
      {
        name: "description",
        content:
          "What we collect when you take the Findability Score, book a call or join the community, and how you can have it removed.",
      },
      { property: "og:title", content: "Privacy Notice | Build With Her Media" },
      {
        property: "og:description",
        content: "What we collect, why we keep it, and how to have it removed.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/privacy") }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    id: "what-we-collect",
    heading: "What we collect",
    body: (
      <p>
        Your name and email, your business name and website, your social handles, the answers you
        give in the Findability Score, the pages you visit, and where you came from, such as a
        podcast, a social post, an event QR code or a partner link.
      </p>
    ),
  },
  {
    id: "why-we-keep-it",
    heading: "Why we keep it",
    body: (
      <p>
        To calculate and email your score, to run your bookings and reminders, to deliver the work
        you paid for, and to send you the emails you asked for. We use one small cookie to remember
        which link brought you here.
      </p>
    ),
  },
  {
    id: "phone-and-texts",
    heading: "Phone numbers and texts",
    body: (
      <p>
        If you give us a phone number we store it with your permission. We are not sending texts
        yet. If that changes you will be asked again before anything is sent.
      </p>
    ),
  },
  {
    id: "who-else-sees-it",
    heading: "Who else sees it",
    body: (
      <p>
        Only the services that run this business: our hosting and database provider, our email
        sender, our payment provider, and Google Calendar for scheduling. We do not sell your
        information.
      </p>
    ),
  },
  {
    id: "your-choices",
    heading: "Your choices",
    body: (
      <p>
        You can ask for a copy of your information, ask us to correct it, or ask us to delete your
        account and everything attached to it. Write to {SITE.email} and we will handle it.
      </p>
    ),
  },
  {
    id: "keeping-it-safe",
    heading: "Keeping it safe",
    body: (
      <p>
        Access is limited to the people who need it to do the work. Payment card details never touch
        our systems.
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Notice"
      lastUpdated="September 5, 2026"
      intro="This notice explains what we collect when you use this site and how to have it removed."
      sections={sections}
    />
  );
}
