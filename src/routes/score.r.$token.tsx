import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { AREAS, PETAL_THORN_LINES, type AreaKey } from "@/lib/score-rubric";
import { getScoreByToken } from "@/lib/score.functions";
import { serviceBySlug, type ServiceSlug } from "@/lib/services";

export const Route = createFileRoute("/score/r/$token")({
  loader: async ({ params }) => {
    const result = await getScoreByToken({ data: { token: params.token } });
    if (!result) throw notFound();
    return result;
  },
  head: () => ({
    meta: [
      { title: "What stage is your business in? | Build With Her Media" },
      {
        name: "description",
        content: "Your stage, your score, your petals and thorns, and the fix that pays first.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResultPage,
  notFoundComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">We cannot find that score</h1>
      <p className="mt-3 text-base text-muted-foreground">
        The link may be incomplete. Take the questions again and we will make you a fresh one.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
        <Link to="/score/quiz">Take the quiz</Link>
      </Button>
    </main>
  ),
});

const RETAKE_DAYS = 90;

function bookingHref(slug: ServiceSlug) {
  return slug === "clarity-call" || slug === "strategy-consult"
    ? { to: "/book/$slug" as const, params: { slug } }
    : { to: "/services/$slug" as const, params: { slug } };
}

function ResultPage() {
  const result = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const firstName = result.fullName.split(" ")[0] ?? result.fullName;
  const growing = (Object.keys(AREAS) as AreaKey[]).filter(
    (area) => !result.petals.includes(area) && !result.thorns.includes(area),
  );
  const retakeDate = new Date(result.createdAt);
  retakeDate.setDate(retakeDate.getDate() + RETAKE_DAYS);
  const retakeLabel = retakeDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const primaryService = result.primaryServiceSlug
    ? serviceBySlug(result.primaryServiceSlug)
    : undefined;
  const secondaryService = result.secondaryServiceSlug
    ? serviceBySlug(result.secondaryServiceSlug)
    : undefined;

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Your stage</p>
      </div>

      {/* 1-3: stage name, score, tagline */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <p className="text-base text-muted-foreground">
          {firstName}
          {result.businessName ? `, ${result.businessName}` : ""}
        </p>
        <h1 className="mt-2 text-4xl">
          You are a {result.stage}
          {result.withThorns ? " with thorns" : ""}.
        </h1>
        <p className="numeric mt-4 text-2xl text-muted-foreground">
          {result.total}
          <span className="text-base"> / 100</span>
        </p>
        <p className="mt-4 text-lg text-muted-foreground">{result.stageTagline}</p>
      </section>

      {/* 4-6: petals, thorns, growing */}
      <section className="mt-10">
        {result.petals.length ? (
          <div>
            <h2 className="text-xl">Your petals</h2>
            <p className="mt-1 text-sm text-muted-foreground">What is working.</p>
            <div className="mt-4 space-y-3">
              {result.petals.map((area) => (
                <div
                  key={area}
                  className="rounded-2xl border border-border bg-blush p-5 text-crimson-dark"
                >
                  <p className="text-sm font-medium">{AREAS[area].short}</p>
                  <p className="mt-1 text-base">{PETAL_THORN_LINES[area].petal}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result.thorns.length ? (
          <div className="mt-8">
            <h2 className="text-xl">Your thorns</h2>
            <p className="mt-1 text-sm text-muted-foreground">What to fix.</p>
            <div className="mt-4 space-y-3">
              {result.thorns.map((area) => (
                <div
                  key={area}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <p className="text-sm font-medium text-muted-foreground">{AREAS[area].short}</p>
                  <p className="mt-1 text-base">{PETAL_THORN_LINES[area].thorn}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {growing.length ? (
          <div className="mt-8">
            <h2 className="text-xl">Growing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Not a petal yet, not a thorn: {growing.map((area) => AREAS[area].short).join(", ")}.
            </p>
          </div>
        ) : null}
      </section>

      {/* 7: the one fix that pays first */}
      {result.topFixes.length ? (
        <section className="mt-12">
          <h2 className="text-2xl">The one fix that pays first</h2>
          <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="eyebrow text-muted-foreground">{AREAS[result.topFixes[0]!.area].short}</p>
            <p className="mt-2 text-lg">{result.topFixes[0]!.fix}</p>
          </div>
        </section>
      ) : null}

      {/* 8: with-thorns block */}
      {result.withThorns ? (
        <section className="mt-10 rounded-2xl border border-dashed border-primary bg-blush p-6">
          <h2 className="text-xl text-crimson-dark">With thorns</h2>
          <p className="mt-2 text-base text-crimson-dark/90">
            Your business works, but it only works when you are in it. A week away and things stop.
            That is what we fix in a full build.
          </p>
        </section>
      ) : null}

      <NextStepSection
        primaryService={primaryService}
        secondaryService={secondaryService}
        stageNextStep={result.stageNextStep}
      />

      {/* 10: share, 11: community */}
      <section className="mt-10 rounded-2xl border border-border p-6">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-base font-medium">Send this to a woman who needs it</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every stage started somewhere. This link is yours to keep, and to pass on.
            </p>
            <Button variant="outline" onClick={copyLink} className="mt-4">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Link copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy my private link
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-blush p-6 text-center">
        <p className="text-base text-crimson-dark">
          Retake this in 90 days. We will hold {retakeLabel} for you.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card text-center">
        <p className="text-base text-muted-foreground">
          Free, and the fastest way to get an answer from someone who has done it.
        </p>
        <Button asChild size="lg" variant="outline" className="mt-5 h-11 px-6">
          <Link to="/community">Join the community</Link>
        </Button>
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/services" className="hover:text-primary">
          Or look at every way to work with us
        </Link>
      </p>
    </main>
  );
}

type NextStepService = ReturnType<typeof serviceBySlug>;

/** Every recommended service, including Clarity Call and Strategy Consult, books straight through with no account needed. */
function NextStepSection({
  primaryService,
  secondaryService,
  stageNextStep,
}: {
  primaryService: NextStepService;
  secondaryService: NextStepService;
  stageNextStep: string;
}) {
  return (
    <section className="mt-12 rounded-2xl bg-secondary p-8">
      <h2 className="text-2xl">Your next step</h2>
      {primaryService ? (
        <>
          <p className="mt-3 text-base text-muted-foreground">{stageNextStep}</p>
          <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
            <Link {...bookingHref(primaryService.slug)}>{primaryService.ctaLabel}</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mt-3 text-base text-muted-foreground">
            Bring this score to a free Clarity Call. Thirty minutes, no pitch deck.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
            <Link to="/book/$slug" params={{ slug: "clarity-call" }}>
              Book your free Clarity Call
            </Link>
          </Button>
        </>
      )}
      {secondaryService ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link
            {...bookingHref(secondaryService.slug)}
            className="text-primary underline-offset-4 hover:underline"
          >
            Or {secondaryService.name.toLowerCase()}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
