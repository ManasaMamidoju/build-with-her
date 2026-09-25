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
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { TOTAL_QUESTION_COUNT } from "@/lib/score-rubric";
import { canonical, SITE } from "@/lib/site";
import { STAGES } from "@/lib/stages";

const faqs = [
  {
    q: "Is the score really free?",
    a: "Yes. You answer, you get the number and the breakdown, and you decide what to do with it. We only ask for an email so the score can reach you.",
  },
  {
    q: "I have no website. Should I still take it?",
    a: "Especially then. Most women we meet start from one social account, and the score tells you what to build first so you do not waste a month on the wrong thing.",
  },
  {
    q: "What is Build With Her Media?",
    a: "A media, systems and AI company in Miami for women who run businesses. We film your story, we build the system behind it, and we teach you to run both.",
  },
  {
    q: "What is the difference between this and DigiMAIDS?",
    a: "DigiMAIDS is our automation studio. If you only want the systems and none of the media, that is where you go. Everything else, including the score and the podcast, lives here.",
  },
  {
    q: "Do you work with women outside Miami?",
    a: "Yes. Filming happens in Miami. Everything else happens wherever you are.",
  },
  {
    q: "What do the stages mean?",
    a: "Every business is somewhere between Seed and Garden. Seed means clients cannot find you yet. Garden means the work keeps coming back on its own. Your stage tells you what to fix next, and your petals and thorns show why.",
  },
  {
    q: "What are thorns?",
    a: 'A thorn is an area where clients are falling out. Most businesses have one or two. A result marked "with thorns" means the business only works when you are in it, which is a different fix.',
  },
  {
    q: "Can my stage change?",
    a: "Yes. Retake the score every 90 days. Most women move a stage within one build.",
  },
];

const doors = [
  {
    icon: Compass,
    title: "Find out where clients lose you",
    body: "A three minute audit of your site, your Google profile, your socials and your follow up, scored the way a client experiences you.",
    cta: "Take the score",
  },
  {
    icon: Mic,
    title: "Be on the podcast",
    body: "Street-style or a full sit-down episode. We film once and it feeds your pages for months.",
    cta: "See the podcast",
    to: "/podcast" as const,
  },
  {
    icon: Wrench,
    title: "Have us build the machine",
    body: "Site, booking, payment, reminders, reviews. Built in weeks, handed over with the keys.",
    cta: "See what we build",
    to: "/services" as const,
  },
];

const steps = [
  {
    n: "01",
    title: `Answer ${TOTAL_QUESTION_COUNT} quick questions`,
    body: "About your site, your Google profile, your socials, your booking and your follow up. Skip what does not apply.",
  },
  {
    n: "02",
    title: "Find your stage",
    body: "Seed, Sprout, Bud, Bloom or Garden. One word for where your business is, and the five areas behind it, so you see exactly where clients fall out.",
  },
  {
    n: "03",
    title: "Get the one fix that pays first",
    body: "Your petals show what is working. Your thorns show what to fix. We give you the single change that brings money back fastest, and a call if you want help doing it.",
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
      <FaqJsonLd items={faqs} />

      <section className="bg-charcoal text-blush-white">
        <div className="container-editorial grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <RoseMark className="h-8 w-8 text-rose" />
              <p className="eyebrow text-rose">Build With Her Media, Miami</p>
            </div>
            <h1 className="mt-6 text-blush-white">
              Clients cannot pay a business they cannot find.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-blush-white/80">
              We show women who run businesses exactly where clients lose them online, then we fix
              it: the pages, the booking, the follow up, and the story that makes clients choose
              you.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/score/quiz">Get your Findability Score</Link>
              </Button>
              <p className="mt-4 text-sm text-blush-white/60">
                Three minutes. Free. No account needed.
              </p>
            </div>
          </div>
          <img
            src="/brand/manasa-portrait.jpg"
            alt="Manasa Mamidoju, founder of Build With Her Media in Miami, holding a red rose"
            className="aspect-[4/5] w-full max-w-sm justify-self-center rounded-2xl object-cover lg:justify-self-end"
          />
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24">
        <h2>Three ways in</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {doors.map((door) => (
            <article
              key={door.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <door.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-5">{door.title}</h3>
              <p className="mt-3 flex-1 text-base text-muted-foreground">{door.body}</p>
              <Link
                to={door.to ?? "/score/quiz"}
                className="mt-6 text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {door.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24">
        <h2>The five stages</h2>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          Every business is somewhere between Seed and Garden.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <div
              key={stage.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <img
                src={stage.image}
                alt={stage.alt}
                loading="lazy"
                className="aspect-square w-full rounded-xl bg-blush object-contain p-3"
              />
              <h3 className="mt-4 text-xl">{stage.name}</h3>
              <p className="numeric mt-1 text-xs text-muted-foreground">{stage.range}</p>
              <p className="mt-2 text-sm text-crimson-dark">{stage.tagline}</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{stage.description}</p>
              <Link
                to="/score/quiz"
                className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Find your stage
              </Link>
            </div>
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
          <Button asChild size="lg" className="mt-10 h-12 px-7 text-base">
            <Link to="/score/quiz">Start the score</Link>
          </Button>
        </div>
      </section>

      <section className="container-editorial py-16 md:py-24">
        <h2>Women who built it, in their own words</h2>
        <div className="mt-10 rounded-2xl bg-blush p-10 text-center">
          <RoseMark className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-4 text-lg text-crimson-dark">
            Filming starts this autumn. The first episodes land here.
          </p>
          <Link
            to="/podcast/apply"
            className="mt-4 inline-block text-base font-medium text-primary underline-offset-4 hover:underline"
          >
            Apply to be a guest
          </Link>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container-editorial py-16 md:py-24">
          <h2>Questions women ask first</h2>
          <div className="prose-editorial mt-8">
            <Accordion type="single" collapsible defaultValue="faq-0">
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

      <section className="bg-primary text-primary-foreground">
        <div className="container-editorial py-16 text-center md:py-24">
          <h2 className="text-primary-foreground">Start with the score.</h2>
          <p className="mt-4 text-lg text-primary-foreground/85">
            Three minutes now saves you a season of guessing.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 bg-white px-7 text-base text-primary hover:bg-white/90"
          >
            <Link to="/score/quiz">Get your Findability Score</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
