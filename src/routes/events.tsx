import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Script } from "@/components/seo/JsonLd";
import { listPublicEvents } from "@/lib/events.functions";
import { canonical } from "@/lib/site";
import { formatDay } from "@/lib/booking-options";

export const Route = createFileRoute("/events")({
  loader: () => listPublicEvents(),
  head: () => ({
    meta: [
      { title: "Where to find us in person | Build With Her Media" },
      {
        name: "description",
        content:
          "The events where we set up, read your Findability Score with you and name the one fix worth doing first.",
      },
      { property: "og:title", content: "Meet us at these events" },
      {
        property: "og:description",
        content: "Come and get your Findability Score read with you, in person.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/events") }],
  }),
  component: Events,
  errorComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">The event list did not load</h1>
      <Button asChild className="mt-8">
        <Link to="/">Go to the home page</Link>
      </Button>
    </main>
  ),
  notFoundComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">Nothing here</h1>
    </main>
  ),
});

function Events() {
  const events = Route.useLoaderData();

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <p className="eyebrow text-primary">Events</p>
      <h1 className="mt-3 text-4xl">Come and find us in person</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        At every event we sit with women, read the Findability Score together and name the one thing
        costing the most money. It takes ten minutes and costs nothing.
      </p>

      {events.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          Nothing on the calendar right now. Take the score and we will tell you when we are near
          you.
        </p>
      ) : (
        <div className="mt-10 grid gap-4">
          {events.map((event) => (
            <article key={event.slug} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="eyebrow text-muted-foreground">{formatDay(event.starts_at)}</p>
              <h2 className="mt-2 text-2xl">{event.title}</h2>
              <p className="mt-1 text-base text-muted-foreground">
                {[event.venue, event.city].filter(Boolean).join(", ")}
              </p>
              {event.description ? (
                <p className="mt-3 text-base text-muted-foreground">{event.description}</p>
              ) : null}
              <Button asChild variant="outline" className="mt-5">
                <Link to="/e/$slug" params={{ slug: event.slug }}>
                  Sign in at this event
                </Link>
              </Button>
              <Script
                data={{
                  "@context": "https://schema.org",
                  "@type": "Event",
                  name: event.title,
                  startDate: event.starts_at,
                  endDate: event.ends_at ?? undefined,
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                  eventStatus: "https://schema.org/EventScheduled",
                  location: {
                    "@type": "Place",
                    name: event.venue ?? event.city ?? "To be announced",
                    address: event.city ?? undefined,
                  },
                  description: event.description ?? undefined,
                  url: canonical(`/e/${event.slug}`),
                }}
              />
            </article>
          ))}
        </div>
      )}

      <section className="mt-12 rounded-2xl bg-blush p-8">
        <h2 className="text-2xl">Cannot make it?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          The score works the same from your kitchen table. Three minutes, and you get the same three
          fixes we would give you at the booth.
        </p>
        <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </section>
    </main>
  );
}
