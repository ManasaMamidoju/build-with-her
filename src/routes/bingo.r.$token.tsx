import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CircleAlert, Info, Loader2, Search, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScoreRing } from "@/components/services/ScoreRing";
import { cn } from "@/lib/utils";
import { AREAS } from "@/lib/score-rubric";
import { BEAUTY_ENDS_LABEL, MYSTERY_SQUARES } from "@/lib/bingo";
import {
  getBingoResult,
  runBingoScan,
  unlockBeautyOffer,
  type BingoResult,
} from "@/lib/bingo.functions";
import { BINGO_SQUARES } from "@/lib/bingo";

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

      <ScanSection token={token} scan={result.scan} total={result.total} />

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

      <BookSection token={token} clarityCallUrl={result.clarityCallUrl} />

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

function BookSection({ clarityCallUrl }: { token: string; clarityCallUrl: string }) {
  return (
    <section id="book" className="mt-12 scroll-mt-6">
      <h2 className="text-3xl">Want help doing this?</h2>
      <p className="mt-2 text-base text-muted-foreground">
        Bring this score to a free call and leave knowing exactly what to fix first.
      </p>

      <div className="mt-6 flex flex-col rounded-2xl border border-primary bg-card p-6 shadow-card ring-2 ring-primary">
        <p className="eyebrow text-muted-foreground">30 minutes · Free</p>
        <h3 className="mt-2 text-2xl">Clarity Call</h3>
        <p className="mt-2 text-base text-muted-foreground">
          We go through your score together and pick the one fix that pays back fastest.
        </p>
        <Button asChild size="lg" className="mt-5 h-12 text-base">
          <a href={clarityCallUrl} target="_blank" rel="noopener noreferrer">
            Book my free Clarity Call <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}

const SQUARE_LABEL: Record<string, string> = Object.fromEntries(
  BINGO_SQUARES.map((s) => [
    s.id,
    s.kind === "scored" ? s.label : s.kind === "mystery" ? s.reveal : s.label,
  ]),
);

/**
 * Kicks off the live scan the first time the page opens, then refreshes the
 * page data every few seconds until the scan is done.
 */
function ScanSection({
  token,
  scan,
  total,
}: {
  token: string;
  scan: BingoResult["scan"];
  total: number;
}) {
  const router = useRouter();
  const start = useServerFn(runBingoScan);
  const started = useRef(false);
  const [slow, setSlow] = useState(false);
  const pending = scan.status === "none" || scan.status === "running";

  useEffect(() => {
    if (!pending) return;
    if (!started.current) {
      started.current = true;
      // The scan call itself can take a minute; when it returns, reload the result.
      start({ data: { token } })
        .catch(() => undefined)
        .finally(() => router.invalidate());
    }
    const poll = window.setInterval(() => router.invalidate(), 8000);
    const slowTimer = window.setTimeout(() => setSlow(true), 90_000);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(slowTimer);
    };
  }, [pending, router, start, token]);

  if (pending) {
    return (
      <section className="mt-10 rounded-2xl border border-primary/30 bg-blush/60 p-6">
        <div className="flex items-start gap-3">
          <Loader2 className="mt-1 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl">Checking your card against the real internet</h2>
            <p className="mt-1 text-base text-muted-foreground">
              We're scanning your website, Google profile, socials and asking an AI assistant who it
              recommends. This takes about a minute; your score will update right here.
            </p>
            {slow ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Still working. You can close this page: we'll email you the verified score.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (scan.status === "failed") return null;

  const changed = Object.entries(scan.verified);
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-2xl">
        <Search className="h-5 w-5 text-primary" aria-hidden="true" /> What our scan found
      </h2>
      {scan.selfTotal !== null && scan.selfTotal !== total ? (
        <p className="mt-2 text-base text-muted-foreground">
          Your card said {scan.selfTotal}. After checking your real profiles, your verified score is{" "}
          <span className="font-semibold text-foreground">{total}</span>.
        </p>
      ) : (
        <p className="mt-2 text-base text-muted-foreground">
          We checked your card against your real website and profiles.
        </p>
      )}

      <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {scan.checks.map((check, i) => (
          <li key={`${check.label}-${i}`} className="flex gap-3 p-4">
            {check.status === "pass" ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-label="Good" />
            ) : check.status === "fail" ? (
              <CircleAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-label="Needs work"
              />
            ) : (
              <Info
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-label="Not checked"
              />
            )}
            <div>
              <p className="font-medium">{check.label}</p>
              <p className="text-sm text-muted-foreground">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {scan.ai ? (
        <div className="mt-6 rounded-2xl bg-secondary p-5">
          <p className="eyebrow text-muted-foreground">We asked an AI assistant</p>
          <p className="mt-1 text-lg">"{scan.ai.query}"</p>
          <p className="mt-2 text-base">
            {scan.ai.mentioned ? "It recommended you." : "You weren't in its answer."}
            {scan.ai.recommended.length ? (
              <> It recommended: {scan.ai.recommended.slice(0, 5).join(", ")}.</>
            ) : null}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{scan.ai.whatAiKnows}</p>
        </div>
      ) : null}

      {changed.length ? (
        <div className="mt-6">
          <p className="text-sm font-medium">Squares we verified</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {changed.map(([id, v]) => (
              <li key={id} className="flex gap-2">
                {v.value ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Yes" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-label="No" />
                )}
                <span>
                  <span className="font-medium">{SQUARE_LABEL[id] ?? id}</span>
                  <span className="text-muted-foreground"> · {v.evidence}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
