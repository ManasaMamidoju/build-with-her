import { createFileRoute, Link } from "@tanstack/react-router";

import { ARTICLES } from "@/lib/learn";
import { AREAS } from "@/lib/score-rubric";
import { SITE, canonical } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn: get found, get booked, get paid | Build With Her Media" },
      {
        name: "description",
        content:
          "Five plain explainers on being found, saying what you sell, gathering proof, taking bookings and making the work compound.",
      },
      { property: "og:title", content: "Learn how to get found and booked" },
      {
        property: "og:description",
        content: "Five free explainers for women running real businesses. No jargon, no upsell.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  return (
    <main className="container-editorial max-w-4xl py-12 md:py-16">
      <p className="eyebrow text-primary">Learn</p>
      <h1 className="mt-3 text-4xl">The five things that decide whether you get booked</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        Everything we build for women comes down to these five. Read them, do them yourself, and if
        you would rather have it built, {SITE.name} does that too.
      </p>

      <div className="mt-10 grid gap-4">
        {ARTICLES.map((article) => (
          <article
            key={article.slug}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <p className="eyebrow text-muted-foreground">{AREAS[article.area]?.short}</p>
            <h2 className="mt-2 text-2xl">
              <Link
                to="/learn/$slug"
                params={{ slug: article.slug }}
                className="hover:text-primary"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-base text-muted-foreground">{article.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">{article.readMinutes} minute read</p>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-2xl bg-blush p-8">
        <h2 className="text-2xl">Not sure which one is your problem?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Answer the questions once and we will tell you which of the five is costing you the most.
        </p>
        <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </section>
    </main>
  );
}
