import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Check } from "lucide-react";

import { RoseMark } from "@/components/brand/RoseMark";
import { Button } from "@/components/ui/button";
import { InstagramEmbed } from "@/components/blog/InstagramEmbed";
import { BlogPostingJsonLd } from "@/components/seo/JsonLd";
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  recordBlogView,
} from "@/lib/blog.functions";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [post, allPosts] = await Promise.all([
      getPublishedBlogPostBySlug({ data: { slug: params.slug } }),
      getPublishedBlogPosts(),
    ]);
    if (!post) throw notFound();
    return { post, others: allPosts.filter((p) => p.slug !== post.slug).slice(0, 3) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Unavailable | Build With Her Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    const title = `${post.title} | Build With Her Media`;
    return {
      meta: [
        { title },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical(`/blog/${params.slug}`) }],
    };
  },
  component: BlogPostPage,
  notFoundComponent: NotFoundPost,
});

function NotFoundPost() {
  return (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">We do not have that post</h1>
      <p className="mt-3 text-base text-muted-foreground">
        The link may be old. Here is everything we have written.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
        <Link to="/blog">See the blog</Link>
      </Button>
    </main>
  );
}

function BlogPostPage() {
  const { post, others } = Route.useLoaderData();
  const slug = post.slug;
  const recordView = useServerFn(recordBlogView);

  useEffect(() => {
    const key = `blog-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing or blocked storage: still count the read, just every time.
    }
    recordView({ data: { slug } }).catch(() => {});
  }, [slug, recordView]);

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Blog</p>
      </div>

      <h1 className="mt-6 text-4xl">{post.title}</h1>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">{post.intro}</p>
      <p className="mt-3 text-sm text-muted-foreground">{post.readMinutes} minute read</p>

      {post.interview ? (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            An interview with{" "}
            <span className="font-medium text-foreground">{post.interview.guestName}</span>
            {post.interview.businessName ? ` · ${post.interview.businessName}` : ""}
          </p>
          <div className="mt-4">
            <InstagramEmbed url={post.interview.instagramUrl} />
          </div>
          {post.interview.backlinkLabel ? (
            <Button asChild variant="outline" className="mt-4">
              <a
                href={post.interview.businessWebsite ?? post.interview.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                {post.interview.backlinkLabel}
              </a>
            </Button>
          ) : null}
        </section>
      ) : null}

      <div className="mt-10 space-y-10">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="prose-editorial mt-4 text-base text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-7 shadow-card">
        <h2 className="text-xl">In practice</h2>
        <ul className="mt-5 space-y-3">
          {post.takeaways.map((item) => (
            <li key={item} className="flex gap-3 text-base">
              <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
          <Link to={post.cta.to}>{post.cta.label}</Link>
        </Button>
      </section>

      {others.length ? (
        <section className="mt-16">
          <h2 className="text-2xl">More opinions</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                to="/blog/$slug"
                params={{ slug: other.slug }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary"
              >
                <p className="text-lg">{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <BlogPostingJsonLd
        slug={post.slug}
        title={post.title}
        description={post.description}
        datePublished={post.publishedAt}
      />
    </main>
  );
}
