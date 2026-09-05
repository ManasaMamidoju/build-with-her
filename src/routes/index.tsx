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
    a: "It is one number out of 100 that says how easy it is for a buyer to find you, understand you and book you. It comes from five areas. Where you show up is worth 25 points and covers your own site, your Google Business Profile and whether you appear when someone searches what you sell in your city. How clear your offer is, worth 20, looks at your first line, who you say you are for, whether prices are visible and whether there is proof of past work. What pulls people in, worth 25, covers reviews, referrals, publishing on a rhythm and whether there is any video or audio of you. How they book you, worth 15, is about self-serve booking, how fast an enquiry gets answered and whether she can pay online. What keeps you growing, worth 15, is follow up, your email list, a reason for past clients to return and knowing where last month's clients came from.",
  },
  {
    q: "How long does it take, and what do I get at the end?",
    a: "About three minutes, roughly 22 questions, one area per screen, and you can go back at any point. At the end you land on your own result page. It shows your number, your band, a bar for each of the five areas so you can see exactly which one is dragging you down, and the three fixes to do first. The fixes are picked from your own answers and each one is written as a single concrete action, not advice like be more visible.",
  },
  {
    q: "What do the bands mean?",
    a: "Under 40 is Undiscoverable, meaning a buyer searching for exactly what you sell will not find you yet. From 40 to 54 is Invisible with a pulse: you exist online but almost nothing is working to bring you buyers. From 55 to 69 is Leaky, which is the most common one. People do find you, and most of them fall out before they book. From 70 to 84 is Solid, where the basics hold and what is missing is the part that compounds. From 85 to 100 is Compounding, where the work you already did keeps returning to you and the next move is scale and story.",
  },
  {
    q: "Do I have to pay or sign up for anything?",
    a: "No. The quiz is free, your result page is free and the clarity call is free. There is no account to create to take the quiz, and there is no card involved. If you want us to build the missing pieces after the call, the price is shown to you plainly before you agree to anything. Nothing gets built and nothing gets charged without you saying yes first.",
  },
  {
    q: "What arrives in my email?",
    a: "Your private result link, so you can come back to your score, your five areas and your fixes whenever you want, from any device. As we add the offers that match your band and the recording of your call, they show up on that same page. You are not being added to a daily newsletter. If you ever want the whole thing gone, ask us and we delete it.",
  },
  {
    q: "Who is this for?",
    a: "Women who own the business, not just the calendar. Salons and studios, service businesses, local shops, agencies, coaches, consultants, anyone who is quietly good at the work and tired of being the best kept secret in her industry. It works whether you have one employee or twelve, and whether your customers come from your street or from search.",
  },
  {
    q: "What happens on the clarity call?",
    a: "Twenty minutes, camera on if you like, no slide deck. We open your score together, agree which of your three fixes is the one for this month, and decide which parts you want to do yourself and which parts you want built for you. If a build makes sense you get a written offer with a price and a timeline. If it does not, you leave with the plan anyway.",
  },
  {
    q: "What happens to my information?",
    a: "Your name, email, business and answers are stored so we can give you your score and reach you about your call. We do not sell your details and we do not pass them to anyone outside the services that run this business, such as our hosting, our email sender and our payment provider. If you give a phone number it stays with your record and we will ask again before ever sending you a text.",
  },
];

const doors = [
  {
    icon: Compass,
    eyebrow: "Start here",
    title: "Find out how findable you are",
    body: "Three minutes of honest questions, then a score, five area results and the three fixes that come first.",
    cta: "Get your Findability Score",
  },
  {
    icon: Wrench,
    eyebrow: "Systems",
    title: "Have the missing pieces built",
    body: "Booking, follow up, reviews, listings, the quiet machinery that turns attention into paid work.",
    cta: "Start with your score",
  },
  {
    icon: Mic,
    eyebrow: "Media",
    title: "Put your story on camera",
    body: "Sit down with Manasa, walk away with an episode, clips and a page that sends people back to you.",
    cta: "Start with your score",
  },
];

const steps = [
  {
    n: "01",
    title: "Answer the questions",
    body: "Five areas, plain language, no jargon. One area per screen and you can go back.",
  },
  {
    n: "02",
    title: "Get your number and your band",
    body: "You see exactly which area is unbuilt, and what a buyer hits when she tries to find you.",
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

      <section className="bg-background">
        <div className="container-editorial py-16 md:py-24">
          <div className="rounded-3xl bg-secondary px-6 py-14 md:px-14 md:py-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <RoseMark className="h-8 w-8 text-primary" />
                <p className="eyebrow text-primary">Media, systems and AI</p>
              </div>
              <h1 className="mt-6">If she cannot find you, she cannot pay you.</h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Build With Her Media scores how findable your business is, then builds the pieces that
                are missing. For women who own the business, not just the calendar.
              </p>
              <div className="mt-10">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link to="/score/quiz">Get your Findability Score</Link>
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  Free, three minutes, no account needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-editorial pb-16 md:pb-24">
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
                to="/score/quiz"
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
          <Button asChild size="lg" className="mt-10 h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
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
