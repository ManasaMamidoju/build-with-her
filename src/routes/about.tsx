import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { SITE, canonical } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Build With Her Media | Media and machines for women in business" },
      {
        name: "description",
        content:
          "We film the women who build things and we build the machine behind them, so the work gets found, booked and paid for.",
      },
      { property: "og:title", content: "About Build With Her Media" },
      {
        property: "og:description",
        content: "Media and machines for women running real businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
  }),
  component: About,
});

function About() {
  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">About us</p>
      </div>
      <h1 className="mt-4 text-4xl">
        We film the women who build things, then we build the machine
      </h1>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">
        {SITE.name} exists because the best businesses we meet are invisible. A woman who is
        excellent at her work loses to someone louder with half the skill, and she assumes she needs
        to post more. She does not. She needs to be findable, understandable, bookable and paid.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl">What we actually do</h2>
        <p className="prose-editorial mt-3 text-base text-muted-foreground">
          Two halves of the same job. The media half puts you on camera and tells your story
          properly, so people meet you before they meet your prices. The build half puts a site,
          booking, payment, replies, reminders and follow up behind that story, so the attention
          turns into money instead of noise.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Who runs it</h2>
        <p className="prose-editorial mt-3 text-base text-muted-foreground">
          Manasa runs the studio. She built her own business the hard way, hired the wrong help,
          paid for things that did nothing, and worked out what actually moves bookings. That is why
          the score exists: so you can see where you stand without paying anyone to tell you.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">What we will not do</h2>
        <ul className="mt-4 space-y-3 text-base text-muted-foreground">
          <li>Sell you a build you do not need. If free tools will do it, we say so.</li>
          <li>Keep your domain, your accounts or your data in our name. Everything is yours.</li>
          <li>Promise numbers we cannot control, like followers or viral reach.</li>
          <li>Hide prices. Every service on the site has a price or a range.</li>
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-blush p-8">
        <h2 className="text-2xl">Start where everyone starts</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Three minutes of questions, a number out of 100, and the three fixes worth doing first.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link to="/services">See ways to work with us</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
