import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { RoseMark } from "@/components/brand/RoseMark";
import { Button } from "@/components/ui/button";
import { BandFirstStep } from "@/components/services/BandFirstStep";
import { PriceTag } from "@/components/services/PriceTag";
import { TestimonialsComingSoon } from "@/components/site/TestimonialsComingSoon";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { SERVICES } from "@/lib/services";
import { canonical, DIGIMAIDS_URL } from "@/lib/site";

const FAQS = [
  {
    q: "Where should I start?",
    a: "With the free Clarity Call, after you take the Findability Score. The score tells us what is costing you money and the call turns that into a plan.",
  },
  {
    q: "Do I have to buy anything to get help?",
    a: "No. The score and the first call are free, and if free tools will fix your problem we will tell you that.",
  },
  {
    q: "Can I pay a build in instalments?",
    a: "Yes. Builds can be split, and every build is invoiced so you have a record for your books.",
  },
  {
    q: "Do I own what you build?",
    a: "Yes. The domain, the site, the accounts and the data are in your name from day one.",
  },
];

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Ways to work with us | Build With Her Media" },
      {
        name: "description",
        content:
          "A free clarity call, a paid strategy consult, done-for-you builds, a live bootcamp and podcast episodes. Start where your Findability Score says to start.",
      },
      { property: "og:title", content: "Ways to work with us | Build With Her Media" },
      {
        property: "og:description",
        content:
          "Free call, strategy consult, automation build, bootcamp and podcast. Pick the one your score points at.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/services") }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main className="container-editorial py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Ways to work with us</p>
      </div>

      <h1 className="mt-6 max-w-3xl">One path. Start where your score says.</h1>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">
        Every offer below fixes a specific gap in your Findability Score. Take the score first and
        the right one is highlighted for you.
      </p>
      <p className="prose-editorial mt-2 text-lg text-muted-foreground">
        Take the score, find your stage, and the right service is marked for you.
      </p>

      <div className="mt-10">
        <BandFirstStep />
      </div>

      <section className="mt-14">
        <div className="relative">
          <div
            className="absolute top-2 bottom-2 left-5 hidden w-px bg-line md:block"
            aria-hidden="true"
          />
          <div className="space-y-8">
            {SERVICES.map((service) => (
              <article key={service.slug} className="relative md:pl-16">
                <span
                  className="absolute top-2 left-1.5 hidden h-7 w-7 items-center justify-center rounded-full border-2 border-rose bg-background md:flex"
                  aria-hidden="true"
                >
                  <RoseMark className="h-3.5 w-3.5 text-primary" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="eyebrow text-muted-foreground">{service.step}</p>
                      <h2 className="mt-2 text-2xl">{service.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="numeric text-xl text-primary">
                        <PriceTag service={service} />
                      </p>
                      <p className="text-sm text-muted-foreground">{service.duration}</p>
                    </div>
                  </div>
                  <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                    {service.summary}
                  </p>
                  <p className="mt-4 text-sm">
                    <span className="font-medium">Best for:</span>{" "}
                    <span className="text-muted-foreground">{service.bestFor}</span>
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Stages:</span>{" "}
                    <span className="text-muted-foreground">{service.stages.join(", ")}</span>
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
                    <Link to="/services/$slug" params={{ slug: service.slug }}>
                      {service.ctaLabel}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-dashed border-border bg-blush p-6 text-center">
        <p className="text-base text-crimson-dark">
          Only want the automations, none of the media? That is DigiMAIDS.
        </p>
        <a
          href={DIGIMAIDS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-base font-medium text-primary underline-offset-4 hover:underline"
        >
          Visit DigiMAIDS
        </a>
      </section>

      <section className="mt-16">
        <TestimonialsComingSoon />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl">Questions women ask before they book</h2>
        <dl className="mt-7 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <dt className="text-lg">{faq.q}</dt>
              <dd className="mt-2 text-base text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <FaqJsonLd items={FAQS} />
    </main>
  );
}
