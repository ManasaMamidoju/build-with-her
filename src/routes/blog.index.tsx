import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { BLOG_POSTS } from "@/lib/blog";
import { getBlogViewCounts } from "@/lib/blog.functions";
import { canonical } from "@/lib/site";

const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "viewed", label: "Most viewed" },
  { value: "alpha", label: "A to Z" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Build With Her Media" },
      {
        name: "description",
        content:
          "Straight opinions on findability, SEO, AEO and the marketing advice that does not hold up, from Manasa at Build With Her Media.",
      },
      { property: "og:title", content: "Blog | Build With Her Media" },
      {
        property: "og:description",
        content: "Straight opinions on findability, SEO, AEO and the advice that does not hold up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
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
      <p className="eyebrow text-primary">Blog</p>
      <h1 className="mt-3 text-4xl">Opinions, not filler</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        The things I do not agree with in this industry, said plainly, with what to do instead.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts"
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
              <h2 className="mt-3 text-2xl">
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-base text-muted-foreground">{post.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {post.readMinutes} minute read
                {views?.[post.slug] ? ` · ${views[post.slug]} reads` : ""}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
