import { createFileRoute } from "@tanstack/react-router";

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

function PrivacyPage() {
  return (
    <main className="container-editorial py-14 md:py-24">
      <p className="eyebrow text-primary">Draft, review before launch</p>
      <h1 className="mt-3">Privacy Notice</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated September 5, 2026</p>

      <div className="prose-editorial mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-2xl">What we collect</h2>
          <p className="mt-3">
            Your name and email, your business name and website, your social handles, the answers you
            give in the Findability Score, the pages you visit, and where you came from, such as a
            podcast, a social post, an event QR code or a partner link.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Why we keep it</h2>
          <p className="mt-3">
            To calculate and email your score, to run your bookings and reminders, to deliver the work
            you paid for, and to send you the emails you asked for. We use one small cookie to
            remember which link brought you here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Phone numbers and texts</h2>
          <p className="mt-3">
            If you give us a phone number we store it with your permission. We are not sending texts
            yet. If that changes you will be asked again before anything is sent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Who else sees it</h2>
          <p className="mt-3">
            Only the services that run this business: our hosting and database provider, our email
            sender, our payment provider, and Google Calendar for scheduling. We do not sell your
            information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Your choices</h2>
          <p className="mt-3">
            You can ask for a copy of your information, ask us to correct it, or ask us to delete your
            account and everything attached to it. Write to {SITE.email} and we will handle it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Keeping it safe</h2>
          <p className="mt-3">
            Access is limited to the people who need it to do the work. Payment card details never
            touch our systems.
          </p>
        </section>
      </div>
    </main>
  );
}
