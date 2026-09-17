import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { articleBySlug } from "@/lib/learn";
import { AREAS } from "@/lib/score-rubric";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/learn/$slug")({
  loader: ({ params }) => {
    const article = articleBySlug(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Learn"} | Build With Her Media` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.title ?? "Learn" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: loaderData ? [{ rel: "canonical", href: canonical(`/learn/${loaderData.slug}`) }] : [],
  }),
  component: ArticlePage,
  notFoundComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">We have not written that one yet</h1>
      <Button asChild className="mt-8">
        <Link to="/learn">See the explainers</Link>
      </Button>
    </main>
  ),
});

function ArticlePage() {
  const article = Route.useLoaderData();

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <p className="eyebrow text-primary">{AREAS[article.area]?.title}</p>
      <h1 className="mt-3 text-4xl">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{article.readMinutes} minute read</p>
      <p className="prose-editorial mt-6 text-lg">{article.intro}</p>

      {article.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl">{section.heading}</h2>
          {section.body.map((paragraph, index) => (
            <p key={index} className="prose-editorial mt-3 text-base text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <section className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-card">
        <h2 className="text-2xl">Do this today</h2>
        <ul className="mt-5 space-y-3">
          {article.checklist.map((item) => (
            <li key={item} className="flex gap-3 text-base">
              <span className="text-primary">&bull;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl bg-blush p-8">
        <h2 className="text-2xl">Want to know how you score on this?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Three minutes of questions gives you a number out of 100 and the three fixes worth doing
          first.
        </p>
        <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        <Link to="/learn" className="hover:text-primary">
          Back to all explainers
        </Link>
      </p>
    </main>
  );
}
