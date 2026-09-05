import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Mic, Wrench } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { FaqJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { canonical, SITE } from "@/lib/site";

const faqs = [
  {
    q: "What is a Findability Score?",
    a: "It is a number out of 100 that shows how easy it is for a buyer to find you, understand you, and book you. It covers five areas: where you show up, how clear your offer is, what pulls people in, how they book, and what keeps you growing.",
  },
  {
    q: "How long does the score take?",
    a: "About three minutes. You answer questions about your business, then you get your number, your five stage results, and the three fixes that move the needle first.",
  },
  {
    q: "Do I have to buy anything?",
    a: "No. The score is free and so is the first call. If you want us to build the missing pieces, the next step is priced clearly before you commit.",
  },
  {
    q: "Who is this for?",
    a: "Women who own businesses and are tired of being the best kept secret in their industry. Service businesses, salons, studios, agencies, coaches, local shops.",
  },
  {
    q: "What happens after I book?",
    a: "You get a confirmation, a video link, and reminders. Everything we build for you shows up in your account so you can see each piece move to done.",
  },
];

const doors = [
  {
    icon: Compass,
    eyebrow: "Start here",
    title: "Find out how findable you are",
    body: "Three minutes of honest questions, then a score, five stage results and the three fixes that come first.",
    cta: "Get your Findability Score",
  },
  {
    icon: Wrench,
    eyebrow: "Systems",
    title: "Have the missing pieces built",
    body: "Booking, follow up, reviews, listings, the quiet machinery that turns attention into paid work.",
    cta: "See what a build includes",
  },
  {
    icon: Mic,
    eyebrow: "Media",
    title: "Put your story on camera",
    body: "Sit down with Manasa, walk away with an episode, clips and a page that sends people back to you.",
    cta: "Look at the podcast",
  },
];

const steps = [
  {
    n: "01",
    title: "Answer the questions",
    body: "Five areas, plain language, no jargon. Skip nothing and it takes three minutes.",
  },
  {
    n: "02",
    title: "Get your number and your band",
    body: "You see exactly which stage is unbuilt, and what a buyer hits when she tries to find you.",
  },
  {
    n: "03",
    title: "Take one clear next step",
    body: "Your band decides what we show you. One offer, one button, no menu of twelve things.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Build With Her Media | Get found, booked and paid" },
      { name: "description", content: SITE.description },
      { property: "og:title", content: "Build With Her Media | Get found, booked and paid" },
      { property: "og:description", content: SITE.description },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FaqJsonLd items={faqs} />

      <section className="bg-charcoal text-blush-white">
        <div className="container-editorial py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <RoseMark className="h-8 w-8 text-rose" />
              <p className="eyebrow text-rose">Media, systems and AI</p>
            </div>
            <h1 className="mt-6">
              If she cannot find you, she cannot pay you.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blush">
              Build With Her Media scores how findable your business is, then builds the pieces that
              are missing. For women who own the business, not just the calendar.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/login">Get your Findability Score</Link>
              </Button>
              <p className="mt-4 text-sm text-blush">Free, three minutes, no sales call required.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24">
        <h2>Three doors in</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Most women arrive knowing something is leaking. Pick the door that sounds like your week.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {doors.map((door) => (
            <article
              key={door.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <door.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <p className="eyebrow mt-5 text-muted-foreground">{door.eyebrow}</p>
              <h3 className="mt-2">{door.title}</h3>
              <p className="mt-3 flex-1 text-base text-muted-foreground">{door.body}</p>
              <Link
                to="/login"
                className="mt-6 text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {door.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container-editorial py-16 md:py-24">
          <h2>How the score works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n}>
                <p className="numeric font-display text-4xl text-primary">{step.n}</p>
                <h3 className="mt-3">{step.title}</h3>
                <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24">
        <h2>Latest episodes</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          No episodes published yet. The first ones appear here as soon as they go live, each with the
          guest, her business and her links.
        </p>
      </section>

      <section className="bg-secondary">
        <div className="container-editorial py-16 md:py-24">
          <h2>Questions women ask first</h2>
          <div className="prose-editorial mt-8">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-lg">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
