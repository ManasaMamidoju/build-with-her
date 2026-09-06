import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { listPublicInterviews } from "@/lib/interviews.functions";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/interviews")({
  loader: () => listPublicInterviews(),
  head: () => ({
    meta: [
      { title: "Interviews with women who own businesses | Build With Her Media" },
      {
        name: "description",
        content:
          "Short interviews filmed at events across South Florida with women who own businesses, in their own words.",
      },
      { property: "og:title", content: "Interviews with women who own businesses" },
      {
        property: "og:description",
        content: "Women tell us what they build, in their own words, filmed at events near you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/interviews") }],
  }),
  component: Interviews,
  errorComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">The interviews did not load</h1>
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

function Interviews() {
  const interviews = Route.useLoaderData();

  return (
    <main className="container-editorial max-w-4xl py-12 md:py-16">
      <p className="eyebrow text-primary">Interviews</p>
      <h1 className="mt-3 text-4xl">Women, in their own words</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        We film short interviews at events across South Florida. Every woman here said yes to
        sharing hers.
      </p>

      {interviews.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          The first interviews go up soon. Come and meet us at an event in the meantime.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {interviews.map((interview) => (
            <article
              key={interview.slug}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              {interview.event_name ? (
                <p className="eyebrow text-muted-foreground">{interview.event_name}</p>
              ) : null}
              <h2 className="mt-2 text-2xl">{interview.full_name}</h2>
              {interview.business_name ? (
                <p className="mt-1 text-base text-muted-foreground">{interview.business_name}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {interview.final_video_link ? (
                  <Button asChild size="sm">
                    <a href={interview.final_video_link} target="_blank" rel="noreferrer">
                      Watch her interview
                    </a>
                  </Button>
                ) : null}
                {interview.instagram ? (
                  <Button asChild size="sm" variant="ghost">
                    <a href={interview.instagram} target="_blank" rel="noreferrer">
                      Follow her
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-border bg-secondary p-6">
        <h2 className="text-2xl">Want to be interviewed?</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Come and find us at an event. It takes ten minutes and costs nothing.
        </p>
        <Button asChild className="mt-5">
          <Link to="/events">See where we will be</Link>
        </Button>
      </div>
    </main>
  );
}
