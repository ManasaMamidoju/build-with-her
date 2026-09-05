import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoseMark } from "@/components/brand/RoseMark";
import { AREAS, type AreaKey } from "@/lib/score-rubric";
import { OFFER_KINDS, offersFor } from "@/lib/offers";
import { getScoreByToken } from "@/lib/score.functions";

export const Route = createFileRoute("/score/r/$token")({
  loader: async ({ params }) => {
    const result = await getScoreByToken({ data: { token: params.token } });
    if (!result) throw notFound();
    return result;
  },
  head: () => ({
    meta: [
      { title: "Your Findability Score | Build With Her Media" },
      { name: "description", content: "Your score, your five areas, and the three fixes to do first." },
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
  const matchedOffers = offersFor(result.total, result.areaScores, 5);

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Your Findability Score</p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <p className="text-base text-muted-foreground">
          {firstName}
          {result.businessName ? `, ${result.businessName}` : ""}
        </p>
        <p className="numeric mt-2 font-display text-7xl leading-none text-primary">
          {result.total}
          <span className="text-2xl text-muted-foreground"> / 100</span>
        </p>
        <h1 className="mt-4 text-3xl">{result.band}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{result.bandLine}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Your five areas</h2>
        <div className="mt-6 space-y-5">
          {result.areaScores.map((row) => {
            const area = AREAS[row.area as AreaKey];
            const pct = row.outOf ? Math.round((row.earned / row.outOf) * 100) : 0;
            return (
              <div key={row.area}>
                <div className="flex items-baseline justify-between">
                  <p className="text-base font-medium">{area?.title ?? row.area}</p>
                  <p className="numeric text-sm text-muted-foreground">
                    {row.earned} of {row.outOf}
                  </p>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">The three fixes to do first</h2>
        <p className="mt-3 text-base text-muted-foreground">
          These are the places where you are losing the most, in order.
        </p>
        <ol className="mt-6 space-y-4">
          {result.topFixes.map((fix, index) => (
            <li
              key={`${fix.area}-${index}`}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <p className="eyebrow text-muted-foreground">
                {AREAS[fix.area as AreaKey]?.short ?? fix.area}
              </p>
              <p className="mt-2 text-lg">
                <span className="numeric mr-2 text-primary">{index + 1}.</span>
                {fix.fix}
              </p>
            </li>
          ))}
          {result.topFixes.length === 0 ? (
            <li className="rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground">
              Nothing is badly broken. The next move is scale and story, not repair.
            </li>
          ) : null}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">What could work for you next</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Picked for your score and your weakest areas. Some you can do yourself for free, some we
          build with you.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {matchedOffers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <p className="eyebrow text-primary">{OFFER_KINDS[offer.kind].label}</p>
              <h3 className="mt-2 text-xl">{offer.title}</h3>
              <p className="mt-2 flex-1 text-base text-muted-foreground">{offer.blurb}</p>
              {offer.href ? (
                <Button asChild variant="outline" className="mt-5 self-start">
                  <a href={offer.href}>{offer.ctaLabel}</a>
                </Button>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  {offer.note ?? "We go through this on your clarity call."}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-secondary p-8">
        <h2 className="text-2xl">Your next step</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Bring this score to a free clarity call. Twenty minutes, no pitch deck, and you leave
          knowing which of these three to do this month and which to have built for you.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Booking opens shortly. Save your link below and we will come to you with times.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-border p-6">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-base font-medium">Keep this link</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This page is yours. It holds your score, your fixes and, soon, the offers that match
              your band. Emailing it to you turns on once our email sending is live, so save it now.
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
    </main>
  );
}
