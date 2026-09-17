import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { Script } from "@/components/seo/JsonLd";
import { canonical, SITE } from "@/lib/site";

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

const promises = [
  "Sell you a build you do not need. If free tools will do it, we say so.",
  "Keep your domain, your accounts or your data in our name. Everything is yours.",
  "Promise numbers we cannot control, like followers or viral reach.",
  "Hide prices. Every service on the site has a price or a range.",
];

const team = [
  { name: "Manasa", role: "Founder, systems and story." },
  { name: "[NAME]", role: "Runs the podcast." },
  { name: "[NAME]", role: "Cuts every clip." },
];

function About() {
  return (
    <main>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Manasa",
          jobTitle: "Founder",
          worksFor: { "@type": "Organization", name: SITE.name },
        }}
      />

      <div className="container-editorial max-w-5xl py-12 md:py-16">
        <div className="flex items-center gap-3">
          <RoseMark className="h-7 w-7 text-primary" />
          <p className="eyebrow text-primary">Meet the founder</p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <ImagePlaceholder label="Manasa's portrait" className="aspect-[4/5] w-full max-w-sm" />

          <div>
            <h1 className="max-w-xl">
              We film the women who build things, then we build the machine.
            </h1>
            <div className="prose-editorial mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                I moved every year until high school, so I never learned how to keep a friend.
                Family was my whole world. I got good at being the smart one and quietly avoided
                anything I might fail at in public.
              </p>
              <p>
                Two years ago a trip home to India got cut short because a job would not give me the
                days. I flew back and decided work would never again keep me from the people I love.
                That is where the systems came from: build the machine so the business runs while
                you live your life.
              </p>
              <p>
                Then I did the scariest thing I could think of. I walked up to strangers at
                networking events with a microphone and asked women how they run their businesses. I
                asked about a hundred. Seventy-eight said yes. Almost none of them were using the
                tools that would have given them their evenings back.
              </p>
              <p>
                Build With Her Media is those two things together: your story, told well, and the
                system behind it, so clients can find you and you can go home.
              </p>
            </div>
            <blockquote className="prose-editorial mt-8 font-display text-2xl italic text-crimson-dark">
              I built this for my eighteen year old self, who wanted to start something and had no
              one to look at.
            </blockquote>
          </div>
        </div>

        <section className="mt-16 rounded-2xl bg-blush p-8">
          <p className="eyebrow text-crimson-dark">Our mission</p>
          <h2 className="mt-2 text-2xl">Ten thousand women found, booked and paid.</h2>
          <p className="mt-3 max-w-2xl text-base text-crimson-dark/80">
            The longer version of this, with the numbers behind it, is being written. Until then
            that one line is the whole plan.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl">What we will not do</h2>
          <ul className="mt-6 space-y-4">
            {promises.map((line) => (
              <li key={line} className="flex gap-3 text-base text-muted-foreground">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-primary" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl">The team</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.role}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <ImagePlaceholder label={member.name} className="aspect-square w-full" />
                <p className="mt-4 text-lg">{member.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-primary p-10 text-center text-primary-foreground">
          <h2 className="text-primary-foreground">Start where everyone starts.</h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-7 text-base text-primary hover:bg-white/90"
            >
              <Link to="/score/quiz">Get your Findability Score</Link>
            </Button>
            <Link
              to="/contact"
              className="text-base font-medium text-primary-foreground underline-offset-4 hover:underline"
            >
              Book a one-on-one with Manasa
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
