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
        give in the Findability Score and Findability Bingo, what our scan finds on your public
        website and social profiles, the pages you visit, and where you came from, such as a
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
        If you give us a phone number and tick the text message box, we may send you marketing and
        reminder texts, including automated ones. We record when you agreed and the exact wording
        you agreed to. Reply STOP to any text to opt out, or HELP for help. Message and data rates
        may apply. We never share your number or your text consent with anyone else for their own
        marketing.
      </p>
    ),
  },
  {
    id: "emails",
    heading: "Emails",
    body: (
      <p>
        We always email you the score you asked for. We only send marketing emails if you ticked the
        email box, and every one has a way to unsubscribe.
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
      lastUpdated="September 25, 2026"
      intro="This notice explains what we collect when you use this site and how to have it removed."
      sections={sections}
    />
  );
}
