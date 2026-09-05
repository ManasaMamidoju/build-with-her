import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "The community of women building alongside you | Build With Her Media" },
      {
        name: "description",
        content:
          "A group of women running real businesses, sharing what works, keeping each other publishing and passing on clients.",
      },
      { property: "og:title", content: "Women building alongside you" },
      {
        property: "og:description",
        content: "Share what works, find suppliers, pass on clients, keep each other publishing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/community") }],
  }),
  component: Community,
});

const WAYS = [
  {
    title: "The group chat",
    body: "Day to day questions, quick answers, and the small wins that keep you going. This is where most women start.",
  },
  {
    title: "The broadcast",
    body: "One message from us when something matters: a cohort opening, a new tutorial, an event where we will be.",
  },
  {
    title: "The classroom",
    body: "Where the bootcamp lessons and recordings live, once your cohort starts. Yours to keep afterwards.",
  },
];

function Community() {
  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Community</p>
      </div>
      <h1 className="mt-4 text-4xl">You are not doing this on your own</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        Every woman in here runs something real. There is no ranking, no pitching, and no pretending
        business is easier than it is. You bring a question, someone who solved it last year answers
        it.
      </p>

      <div className="mt-10 grid gap-4">
        {WAYS.map((way) => (
          <div key={way.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl">{way.title}</h2>
            <p className="mt-2 text-base text-muted-foreground">{way.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-2xl bg-blush p-8">
        <h2 className="text-2xl">How to get in</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Invitations go out by hand, so the room stays useful. Take the Findability Score and tick
          the community box, or ask us on your clarity call and we will add you the same week.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link to="/contact">Ask for an invite</Link>
          </Button>
        </div>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Already with us? Turn the community invite on in{" "}
        <Link to="/app/settings" className="text-primary hover:underline">
          your details
        </Link>
        .
      </p>
    </main>
  );
}
