import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScoreRing } from "@/components/services/ScoreRing";
import { cn } from "@/lib/utils";
import { AREAS } from "@/lib/score-rubric";
import { BEAUTY_ENDS_LABEL, MYSTERY_SQUARES } from "@/lib/bingo";
import { getBingoResult, unlockBeautyOffer } from "@/lib/bingo.functions";

export const Route = createFileRoute("/bingo/r/$token")({
  loader: async ({ params }) => {
    const result = await getBingoResult({ data: { token: params.token } });
    if (!result) throw notFound();
    return result;
  },
  head: () => ({
    meta: [
      { title: "Your Findability Score | Build With Her Media" },
      { name: "description", content: "Your score, your character and your next steps." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BingoResultPage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl">We cannot find that score</h1>
      <p className="mt-3 text-base text-muted-foreground">
        The link may be incomplete. Play the card again and we will make you a fresh one.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
        <Link to="/bingo">Back to Findability Bingo</Link>
      </Button>
    </main>
  ),
});

const TAG_HELP: Record<string, string> = {
  SEO: "Google search",
  AEO: "Answer engines",
  GEO: "AI search",
};

function BingoResultPage() {
  const result = Route.useLoaderData();
  const { token } = Route.useParams();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 md:pt-12">
      <p className="eyebrow text-primary">Findability Bingo · your result</p>

      {/* Character + score */}
      <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <p className="text-base text-muted-foreground">
              {result.firstName}
              {result.businessName ? `, ${result.businessName}` : ""}
            </p>
            <h1 className="mt-1 text-4xl sm:text-5xl">You're a {result.stage}.</h1>
            <p className="mt-3 text-lg">{result.stageTagline}</p>
            <p className="mt-2 text-base text-muted-foreground">{result.stageDescription}</p>
          </div>
          <img
            src={result.stageImage}
            alt={result.stageAlt}
            className="mx-auto h-40 w-40 object-contain sm:h-48 sm:w-48"
          />
        </div>
        <div className="grid items-center gap-6 border-t border-border bg-blush/60 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <ScoreRing score={result.total} />
          <div className="space-y-3">
            {result.areaScores.map((a) => {
              const pct = a.outOf ? Math.round((a.earned / a.outOf) * 100) : 0;
              return (
                <div key={a.area}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{AREAS[a.area].short}</span>
                    <span className="numeric text-muted-foreground">
                      {a.earned}/{a.outOf}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-primary/15">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {result.bingos > 0 ? (
              <p className="pt-1 text-sm font-semibold text-primary">
                {result.bingos === 1 ? "You got a BINGO!" : `You got ${result.bingos} BINGOS!`} Show
                Manasa at the booth.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-12">
        <h2 className="text-3xl">Your top {result.fixes.length} next steps</h2>
        <p className="mt-2 text-base text-muted-foreground">
          In order of what moves your score most. Tags show where each one helps you get found:{" "}
          {Object.entries(TAG_HELP)
            .map(([tag, help]) => `${tag} = ${help}`)
            .join(", ")}
          .
        </p>
        <ol className="mt-6 space-y-3">
          {result.fixes.map((fix, i) => (
            <li
              key={fix.squareId}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <span className="font-display text-3xl font-bold leading-none text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-medium leading-snug">{fix.title}</p>
                <p className="mt-1.5 text-base text-muted-foreground">{fix.how}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {fix.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    {AREAS[fix.area].short}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <BookSection
        token={token}
        clarityCallUrl={result.clarityCallUrl}
        strategyCallUrl={result.strategyCallUrl}
        beautyLive={result.beautyLive}
      />

      {/* The three mystery squares, revealed */}
      <section className="mt-12 rounded-2xl border border-dashed border-primary/50 p-6">
        <h2 className="text-xl">The three mystery squares</h2>
        <ul className="mt-3 space-y-2 text-base">
          {MYSTERY_SQUARES.map((s) => (
            <li key={s.id} className="flex gap-2">
              {result.checked[s.id] ? (
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-label="Ticked" />
              ) : (
                <span className="mt-1 h-4 w-4 shrink-0 rounded border border-foreground/40" />
              )}
              <span>
                <span className="font-medium">#{s.number}:</span> {s.reveal}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        We emailed you a copy. Bookmark this page to come back to your steps any time.
      </p>
    </main>
  );
}

function BookSection({
  token,
  clarityCallUrl,
  strategyCallUrl,
  beautyLive,
}: {
  token: string;
  clarityCallUrl: string;
  strategyCallUrl: string;
  beautyLive: boolean;
}) {
  const unlock = useServerFn(unlockBeautyOffer);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "invalid" | "expired">("idle");
  const [beautyUrl, setBeautyUrl] = useState<string | null>(null);

  async function applyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    setStatus("checking");
    try {
      const res = await unlock({ data: { code, token } });
      if (res.ok) {
        setBeautyUrl(res.url);
        setStatus("idle");
      } else {
        setStatus(res.reason);
      }
    } catch {
      setStatus("invalid");
    }
  }

  return (
    <section id="book" className="mt-12 scroll-mt-6">
      <h2 className="text-3xl">Want help doing this?</h2>
      <p className="mt-2 text-base text-muted-foreground">
        Bring this score to a call and leave knowing exactly what to fix first.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
          <p className="eyebrow text-muted-foreground">30 minutes · Free</p>
          <h3 className="mt-2 text-2xl">Clarity Call</h3>
          <p className="mt-2 flex-1 text-base text-muted-foreground">
            We go through your score together and pick the one fix that pays back fastest.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-5 h-12 text-base">
            <a href={clarityCallUrl} target="_blank" rel="noopener noreferrer">
              Book a free Clarity Call
            </a>
          </Button>
        </div>

        <div
          className={cn(
            "flex flex-col rounded-2xl border bg-card p-6 shadow-card",
            beautyUrl ? "border-primary ring-2 ring-primary" : "border-border",
          )}
        >
          <p className="eyebrow text-muted-foreground">2 hours · 1:1</p>
          <h3 className="mt-2 text-2xl">Strategy Call</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Your offer, pages, Google and AI findability, and follow up, ending with a build plan.
          </p>
          <p className="numeric mt-4 text-3xl">
            {beautyUrl ? (
              <>
                <span className="mr-2 text-xl text-muted-foreground line-through">$200</span>$50
              </>
            ) : (
              "$200"
            )}
          </p>

          {beautyUrl ? (
            <>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> Code BEAUTY applied. Book before{" "}
                {BEAUTY_ENDS_LABEL}.
              </p>
              <Button asChild size="lg" className="mt-5 h-12 text-base">
                <a href={beautyUrl} target="_blank" rel="noopener noreferrer">
                  Book my $50 Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </>
          ) : (
            <>
              {beautyLive ? (
                <form onSubmit={applyCode} className="mt-4">
                  <Label htmlFor="promo" className="text-sm">
                    Have a code?
                  </Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="promo"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (status !== "checking") setStatus("idle");
                      }}
                      placeholder="Enter code"
                      autoCapitalize="characters"
                      className="h-11 uppercase"
                      maxLength={40}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="h-11"
                      disabled={status === "checking"}
                    >
                      {status === "checking" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {status === "invalid" ? (
                    <p className="mt-1.5 text-sm text-destructive">That code does not work.</p>
                  ) : null}
                  {status === "expired" ? (
                    <p className="mt-1.5 text-sm text-destructive">
                      That code ended with Beauty Weekend.
                    </p>
                  ) : null}
                </form>
              ) : null}
              <div className="flex-1" />
              <Button asChild size="lg" className="mt-5 h-12 text-base">
                <a href={strategyCallUrl} target="_blank" rel="noopener noreferrer">
                  Book a Strategy Call
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
