import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ARTICLES } from "@/lib/learn";
import { BLOG_POSTS } from "@/lib/blog";
import { getBlogViewCounts } from "@/lib/blog.functions";
import { AREA_ORDER, AREAS } from "@/lib/score-rubric";
import { SITE, canonical } from "@/lib/site";

const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "viewed", label: "Most viewed" },
  { value: "alpha", label: "A to Z" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn the system | Build With Her Media" },
      {
        name: "description",
        content:
          "SCALE is how a client experiences you: they find you, understand you, trust you, book you, and come back. One article per step, plus everything else we have written.",
      },
      { property: "og:title", content: "Learn how to get found and booked" },
      {
        property: "og:description",
        content: "Free explainers for women running real businesses. No jargon, no upsell.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  const viewsFn = useServerFn(getBlogViewCounts);
  const { data: views } = useQuery({ queryKey: ["blog", "views"], queryFn: () => viewsFn() });

  const posts = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = BLOG_POSTS.filter((post) => {
      if (!term) return true;
      return (
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        post.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "viewed") return (views?.[b.slug] ?? 0) - (views?.[a.slug] ?? 0);
      return b.publishedAt.localeCompare(a.publishedAt);
    });

    return list;
  }, [search, sort, views]);

  return (
    <main className="container-editorial max-w-4xl py-12 md:py-16">
      <p className="eyebrow text-primary">Learn</p>
      <h1 className="mt-3 text-4xl">Learn the system</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        SCALE is how a client experiences you: they find you, understand you, trust you, book you,
        and come back. One article per step.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {AREA_ORDER.map((key) => {
          const area = AREAS[key];
          const article = ARTICLES.find((a) => a.area === key);
          return (
            <div
              key={key}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <p className="eyebrow text-primary">{area.title}</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{area.blurb}</p>
              {article ? (
                <Link
                  to="/learn/$slug"
                  params={{ slug: article.slug }}
                  className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Read
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl">Everything we have written</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Straight opinions on findability, SEO, AEO and the marketing advice that does not hold up,
          from {SITE.name}.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles"
            className="h-11 max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  sort === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-border p-6 text-base text-muted-foreground">
              Nothing matches that search.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-2xl">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 text-base text-muted-foreground">{post.description}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {post.readMinutes} minute read
                  {views?.[post.slug] ? ` · ${views[post.slug]} reads` : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

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
