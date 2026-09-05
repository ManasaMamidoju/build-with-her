import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AREAS, type AreaKey } from "@/lib/score-rubric";
import { getMyScores } from "@/lib/member.functions";
import { formatDay } from "@/lib/booking-options";

export const Route = createFileRoute("/_authenticated/app/score")({
  head: () => ({
    meta: [
      { title: "Your score | Build With Her Media" },
      { name: "description", content: "Your latest Findability Score, area by area, with your fixes." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyScore,
});

function MyScore() {
  const scoresFn = useServerFn(getMyScores);
  const { data, isLoading } = useQuery({ queryKey: ["my-scores"], queryFn: () => scoresFn({}) });

  const latest = data?.[0];
  const history = data?.slice(1) ?? [];

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl">Your score</h1>

      {isLoading ? (
        <p className="mt-4 text-base text-muted-foreground">Fetching your score.</p>
      ) : !latest ? (
        <div className="mt-6 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-2xl">No score yet</h2>
          <p className="mt-3 text-base text-muted-foreground">
            The questions take three minutes. You get a number out of 100, your five areas, and the
            three fixes worth doing first.
          </p>
          <Button asChild className="mt-6">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-card">
            <p className="numeric font-display text-6xl leading-none text-primary">
              {latest.total}
              <span className="text-xl text-muted-foreground"> / 100</span>
            </p>
            <p className="mt-2 text-lg">{latest.band}</p>
            <p className="mt-1 text-sm text-muted-foreground">Taken {formatDay(latest.createdAt)}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl">Your five areas</h2>
            <div className="mt-6 space-y-5">
              {latest.areaScores.map((row) => {
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

          <section className="mt-10">
            <h2 className="text-2xl">Your fixes</h2>
            <ol className="mt-5 space-y-4">
              {latest.topFixes.map((fix, index) => (
                <li
                  key={`${fix.area}-${index}`}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <p className="eyebrow text-muted-foreground">
                    {AREAS[fix.area as AreaKey]?.short ?? fix.area}
                  </p>
                  <p className="mt-2 text-lg">{fix.fix}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl">Your history</h2>
            {history.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-border p-6 text-base text-muted-foreground">
                One score so far. Take the questions again after you have done a fix and this list
                will show the change.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {history.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-baseline justify-between rounded-2xl border border-border p-5"
                  >
                    <span className="text-base">{formatDay(row.createdAt)}</span>
                    <span className="numeric text-base text-primary">{row.total} / 100</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" className="mt-6">
              <Link to="/score/quiz">Take it again</Link>
            </Button>
          </section>
        </>
      )}
    </main>
  );
}
