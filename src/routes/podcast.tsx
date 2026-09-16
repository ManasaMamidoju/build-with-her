import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/services/PriceTag";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { SERVICES } from "@/lib/services";
import { canonical } from "@/lib/site";

const FAQS = [
  {
    q: "Do I need to be good on camera?",
    a: "No. We ask the questions, keep it short, and cut anything you do not like. Most women say the first minute is the only hard part.",
  },
  {
    q: "What do I get afterwards?",
    a: "The episode, the clips with captions, and an episode page on our site that links to yours. The files are yours to post anywhere.",
  },
  {
    q: "How do I apply?",
    a: "Fill in the guest application on this page. Six short questions, and we reply within five working days either with a booking link or with the one thing we would fix first.",
  },
];

export const Route = createFileRoute("/podcast")({
  head: () => ({
    meta: [
      { title: "The podcast: women who built it | Build With Her Media" },
      {
        name: "description",
        content:
          "Honest conversations with women running real businesses, cut into clips you can use. See the formats, the prices and how to apply.",
      },
      { property: "og:title", content: "The podcast: women who built it" },
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
  const formats = SERVICES.filter((service) => service.slug.startsWith("podcast-"));

  return (
    <main className="container-editorial max-w-4xl py-12 md:py-16">
      <p className="eyebrow text-primary">The podcast</p>
      <h1 className="mt-3 text-4xl">Women who built it, in their own words</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        One honest conversation about how the business actually got built, filmed properly and cut
        into pieces you can use for months. It is the fastest proof you will ever own.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl">Episodes</h2>
        <div className="mt-5 rounded-2xl border border-border bg-blush p-8">
          <h3 className="text-xl">Filming starts this autumn</h3>
          <p className="mt-3 text-base text-muted-foreground">
            No episodes published yet. The first run is being filmed now, and every episode gets its
            own page here with the guest's links. Pick a format and a time below, no sign-in and no
            score needed.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
            <Link to="/podcast/book">Book your slot</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">The two formats</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {formats.map((format) => (
            <div
              key={format.slug}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <p className="eyebrow text-primary">{format.step}</p>
              <h3 className="mt-2 text-xl">{format.name}</h3>
              <p className="numeric mt-2 text-lg text-primary">
                <PriceTag service={format} />
              </p>
              <p className="mt-2 text-base text-muted-foreground">{format.summary}</p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/services/$slug" params={{ slug: format.slug }}>
                  What is included
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
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

      <section className="mt-12 rounded-2xl bg-secondary p-8">
        <h2 className="text-2xl">Want to be a guest?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Book a slot straight off the calendar, no sign-in and no score needed. Prefer to tell us
          more first? Six short questions and we reply within five working days.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/podcast/book">Book your slot</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link to="/podcast/apply">Apply to be a guest</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
