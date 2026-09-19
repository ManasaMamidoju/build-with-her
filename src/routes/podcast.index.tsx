import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoseMark } from "@/components/brand/RoseMark";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { PriceTag } from "@/components/services/PriceTag";
import { FaqJsonLd, Script } from "@/components/seo/JsonLd";
import { listPublicInterviews } from "@/lib/interviews.functions";
import { SERVICES } from "@/lib/services";
import { canonical, SITE } from "@/lib/site";

const FAQS = [
  {
    q: "I hate being on camera.",
    a: "Most women say that first. We ask the questions, keep it short, and cut anything you do not like.",
  },
  {
    q: "Where does it get posted?",
    a: "On our podcast channels, and you get the files to post yourself. You are tagged as a collaborator.",
  },
  {
    q: "Can I approve it first?",
    a: "Yes. You get a preview and two rounds of changes on short clips before anything goes out.",
  },
  {
    q: "Do I need to prepare?",
    a: "We send you a brief on the topics we will cover and talk it through before filming, not the exact questions, so your answers stay natural instead of rehearsed.",
  },
];

type Platform = "all" | "instagram" | "youtube";
type SortKey = "name" | "recent";

function isYoutubeLink(link: string | null | undefined) {
  return Boolean(link && /youtu\.?be/i.test(link));
}

export const Route = createFileRoute("/podcast/")({
  loader: () => listPublicInterviews(),
  head: () => ({
    meta: [
      { title: "The podcast: women who built it | Build With Her Media" },
      {
        name: "description",
        content:
          "Every business has a seed, some thorns and a bloom. We sit with the women who grew one and ask how, then film it.",
      },
      { property: "og:title", content: "Women who built it, in their own words" },
      {
        property: "og:description",
        content: "Honest conversations with women running real businesses, filmed properly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/podcast") }],
  }),
  component: Podcast,
});

function Podcast() {
  const allInterviews = Route.useLoaderData();
  const formats = SERVICES.filter((service) => service.slug.startsWith("podcast-"));

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  // Only guests actually posted somewhere a client can watch: the real
  // Instagram post/reel, or a YouTube link for long form. Internal editing
  // links (Drive, Photos, Frame.io, Descript) never count as "posted".
  const posted = useMemo(
    () =>
      allInterviews.filter(
        (i) => Boolean(i.instagram_post_url) || isYoutubeLink(i.final_video_link),
      ),
    [allInterviews],
  );

  const interviews = useMemo(() => {
    let rows = posted;
    if (platform === "instagram") rows = rows.filter((i) => Boolean(i.instagram_post_url));
    if (platform === "youtube") rows = rows.filter((i) => isYoutubeLink(i.final_video_link));

    const term = search.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (i) =>
          i.full_name?.toLowerCase().includes(term) ||
          i.business_name?.toLowerCase().includes(term) ||
          i.event_name?.toLowerCase().includes(term),
      );
    }

    rows = [...rows];
    if (sort === "name") {
      rows.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
    } else {
      rows.sort((a, b) => (b.interview_date ?? "").localeCompare(a.interview_date ?? ""));
    }
    return rows;
  }, [posted, platform, search, sort]);

  return (
    <main>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          name: `${SITE.name} Podcast`,
          description: "Women who built it, in their own words.",
          url: canonical("/podcast"),
          webFeed: canonical("/podcast"),
        }}
      />
      <section className="bg-charcoal text-blush-white">
        <div className="container-editorial max-w-3xl py-16 md:py-24">
          <p className="eyebrow text-rose">The podcast</p>
          <h1 className="mt-3 text-blush-white">Women who built it, in their own words</h1>
          <p className="mt-5 max-w-xl text-xl text-blush-white/80">
            Every business has a seed, some thorns, and a bloom. We sit with the women who grew one
            and ask how.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
            <Link to="/podcast/apply">Apply to be a guest</Link>
          </Button>
        </div>
      </section>

      <div className="container-editorial max-w-4xl py-12 md:py-16">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl">Episodes</h2>
            <p className="text-sm text-muted-foreground">
              {posted.length} guest{posted.length === 1 ? "" : "s"} posted so far
            </p>
          </div>

          {posted.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-border bg-blush p-8">
              <RoseMark className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl">Filming starts this autumn</h3>
              <p className="mt-3 text-base text-muted-foreground">The first episodes land here.</p>
              <Link
                to="/podcast/apply"
                className="mt-4 inline-block text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                Apply to be a guest
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search guests or businesses"
                    className="h-11 pl-9"
                    aria-label="Search episodes"
                  />
                </div>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="h-11 rounded-md border border-border bg-card px-3 text-sm"
                  aria-label="Filter by platform"
                >
                  <option value="all">All platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube (long form)</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-11 rounded-md border border-border bg-card px-3 text-sm"
                  aria-label="Sort episodes"
                >
                  <option value="recent">Newest first</option>
                  <option value="name">By name</option>
                </select>
              </div>

              {interviews.length === 0 ? (
                <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
                  No guests match that search.
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {interviews.map((interview) => (
                    <article
                      key={interview.slug}
                      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
                    >
                      <Script
                        data={{
                          "@context": "https://schema.org",
                          "@type": "Person",
                          name: interview.full_name,
                          ...(interview.business_name
                            ? {
                                affiliation: {
                                  "@type": "Organization",
                                  name: interview.business_name,
                                },
                              }
                            : {}),
                        }}
                      />
                      <ImagePlaceholder
                        label={interview.full_name ?? "Guest"}
                        className="aspect-video w-full"
                      />
                      {interview.event_name ? (
                        <p className="eyebrow mt-4 text-muted-foreground">{interview.event_name}</p>
                      ) : null}
                      <h3 className="mt-2 text-xl">{interview.full_name}</h3>
                      {interview.business_name ? (
                        <p className="mt-1 text-base text-muted-foreground">
                          {interview.business_name}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {isYoutubeLink(interview.final_video_link) ? (
                          <Button asChild size="sm">
                            <a href={interview.final_video_link!} target="_blank" rel="noreferrer">
                              Watch on YouTube
                            </a>
                          </Button>
                        ) : interview.instagram_post_url ? (
                          <Button asChild size="sm">
                            <a href={interview.instagram_post_url} target="_blank" rel="noreferrer">
                              Watch her interview
                            </a>
                          </Button>
                        ) : null}
                        {interview.instagram ? (
                          <Button asChild size="sm" variant="ghost">
                            <a href={interview.instagram} target="_blank" rel="noreferrer">
                              Follow on Instagram
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-16 rounded-2xl bg-blush p-8">
          <h2 className="text-2xl">Two ways to be on it</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {formats.map((format) => (
              <div
                key={format.slug}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <p className="eyebrow text-primary">{format.step}</p>
                <h3 className="mt-2 text-xl">{format.name}</h3>
                <p className="numeric mt-2 text-lg text-primary">
                  <PriceTag service={format} />
                </p>
                <p className="mt-2 flex-1 text-base text-muted-foreground">{format.summary}</p>
                <Button asChild variant="outline" className="mt-5 self-start">
                  <Link to="/services/$slug" params={{ slug: format.slug }}>
                    {format.ctaLabel}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Both are paid before we film. Every guest gets a public page here and a link back to her
            business.
          </p>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl">The notebook</h2>
          <p className="prose-editorial mt-4 font-display text-xl italic text-muted-foreground">
            Every guest leaves a handwritten note for the woman who sits down next. She never knows
            who wrote hers. It is the one part of the show we cannot script.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl">Questions women ask first</h2>
          <dl className="mt-5 space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border p-6">
                <dt className="text-lg font-medium">{faq.q}</dt>
                <dd className="mt-2 text-base text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
          <FaqJsonLd items={FAQS} />
        </section>
      </div>

      <section className="bg-primary text-primary-foreground">
        <div className="container-editorial py-16 text-center md:py-20">
          <h2 className="text-primary-foreground">Your story, filmed once, working for months.</h2>
          <Button
            asChild
            size="lg"
            className="mt-7 h-12 bg-white px-7 text-base text-primary hover:bg-white/90"
          >
            <Link to="/podcast/apply">Apply to be a guest</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
