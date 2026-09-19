import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { TOTAL_QUESTION_COUNT } from "@/lib/score-rubric";
import { canonical, SITE } from "@/lib/site";

const pills = ["Source", "Clarity", "Attract", "Land", "Elevate"];

const whatYouGet = [
  "Your stage: Seed, Sprout, Bud, Bloom or Garden",
  "Your score out of 100, with a plain sentence on what it means",
  "Your petals (what is working) and your thorns (what to fix)",
  "The one fix that pays back first, and a free call if you want help",
];

export const Route = createFileRoute("/score/")({
  head: () => ({
    meta: [
      { title: "Find out what stage your business is in | Build With Her Media" },
      {
        name: "description",
        content:
          "A few quick questions about how a new client finds you, understands you, trusts you, books you, and comes back. Three minutes. Your stage, your score, and the five areas behind it.",
      },
      { property: "og:title", content: "Find out what stage your business is in" },
      { property: "og:description", content: SITE.description },
    ],
    links: [{ rel: "canonical", href: canonical("/score") }],
  }),
  component: ScoreLanding,
});

function ScoreLanding() {
  return (
    <main className="bg-background">
      <div className="container-editorial max-w-3xl py-16 md:py-24">
        <div className="flex items-center gap-3">
          <RoseMark className="h-7 w-7 text-primary" />
          <p className="eyebrow text-primary">Findability Score</p>
        </div>
        <h1 className="mt-4">Find out what stage your business is in.</h1>
        <p className="prose-editorial mt-5 text-lg text-muted-foreground">
          {TOTAL_QUESTION_COUNT} quick questions about how a new client finds you, understands you,
          trusts you, books you, and comes back. Three minutes. You get your stage, your score, and
          the five areas behind it.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={pill}
              className="eyebrow rounded-full border border-line bg-blush px-4 py-2 text-crimson-dark"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/score/quiz">Start the score</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No account needed. You enter an email at the end so the score can reach you.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-card">
          <p className="eyebrow text-muted-foreground">What you get</p>
          <ul className="mt-4 space-y-3">
            {whatYouGet.map((line) => (
              <li key={line} className="flex gap-3 text-base text-foreground">
                <RoseMark className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl bg-secondary p-6 text-center">
          <p className="text-base text-muted-foreground">
            Rather watch first? The full SCALE tutorial is on YouTube.
          </p>
          <a
            href="https://youtube.com/@buildwithher"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-base font-medium text-primary underline-offset-4 hover:underline"
          >
            Watch the tutorial
          </a>
        </div>
      </div>
    </main>
  );
}
