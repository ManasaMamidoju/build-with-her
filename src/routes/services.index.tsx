import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { RoseMark } from "@/components/brand/RoseMark";
import { Button } from "@/components/ui/button";
import { BandFirstStep } from "@/components/services/BandFirstStep";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { SERVICES } from "@/lib/services";
import { canonical } from "@/lib/site";

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

      <h1 className="mt-6 max-w-3xl">Start free, and only pay when the next step is obvious</h1>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">
        Every woman here starts in the same place: the score, then a free call. What comes after
        depends on what the score found, and on whether you want to run the machine yourself or have
        us build it.
      </p>

      <div className="mt-10">
        <BandFirstStep />
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">The ladder</h2>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <article
              key={service.slug}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <p className="eyebrow text-muted-foreground">{service.step}</p>
              <h3 className="mt-3 text-xl">{service.name}</h3>
              <p className="numeric mt-2 text-lg text-primary">{service.price}</p>
              <p className="mt-3 flex-1 text-base text-muted-foreground">{service.summary}</p>
              <p className="mt-4 text-sm text-muted-foreground">{service.duration}</p>
              <Button asChild variant="outline" className="mt-6 h-11 justify-between">
                <Link to="/services/$slug" params={{ slug: service.slug }}>
                  See what is included
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
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
