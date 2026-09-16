import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Our mission | Build With Her Media" },
      {
        name: "description",
        content:
          "Ten thousand women found, booked and paid. The longer version of why we do this is being written.",
      },
      { property: "og:title", content: "Our mission" },
      {
        property: "og:description",
        content: "Ten thousand women found, booked and paid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/mission") }],
  }),
  component: Mission,
});

function Mission() {
  return (
    <main className="container-editorial max-w-2xl py-16 md:py-24">
      <p className="eyebrow text-primary">Our mission</p>
      <h1 className="mt-3 text-4xl">Ten thousand women found, booked and paid</h1>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">
        The longer version of this, with the numbers behind it, is being written. Until then that
        one line is the whole plan.
      </p>
      <Button asChild size="lg" className="mt-10 h-12 px-7 text-base">
        <Link to="/score/quiz">Take the quiz</Link>
      </Button>
    </main>
  );
}
