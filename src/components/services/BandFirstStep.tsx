import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getScoreByToken } from "@/lib/score.functions";
import { getRememberedScoreToken } from "@/lib/score-memory";
import { BAND_FIRST_STEP, serviceBySlug } from "@/lib/services";

/**
 * Shows the offer that matches her score band. If this browser has no score
 * yet, it invites her to take the questions instead.
 */
export function BandFirstStep() {
  const [token, setToken] = useState<string | null>(null);
  const fetchScore = useServerFn(getScoreByToken);

  useEffect(() => {
    setToken(getRememberedScoreToken());
  }, []);

  const { data } = useQuery({
    queryKey: ["score", token],
    enabled: Boolean(token),
    queryFn: () => fetchScore({ data: { token: token as string } }),
  });

  if (!data) {
    return (
      <section className="rounded-2xl border border-border bg-blush p-8 shadow-card">
        <p className="eyebrow text-primary">Where to start</p>
        <h2 className="mt-3 text-2xl">Not sure which of these is yours?</h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Answer the questions once and we will point at the one thing to fix first, then show you
          the offer that matches it.
        </p>
        <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </section>
    );
  }

  const match = BAND_FIRST_STEP[data.band] ?? BAND_FIRST_STEP["Undiscoverable"];
  const primary = serviceBySlug(match.primary);
  const secondary = serviceBySlug(match.secondary);

  return (
    <section className="rounded-2xl border border-border bg-blush p-8 shadow-card">
      <p className="eyebrow text-primary">
        Your score: {data.total} of 100, {data.band}
      </p>
      <h2 className="mt-3 text-2xl">{match.headline}</h2>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        {primary ? (
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/services/$slug" params={{ slug: primary.slug }}>
              {primary.name}
            </Link>
          </Button>
        ) : null}
        {secondary ? (
          <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
            <Link to="/services/$slug" params={{ slug: secondary.slug }}>
              Or look at {secondary.name}
            </Link>
          </Button>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link to="/score/r/$token" params={{ token: token as string }} className="hover:text-primary">
          Open your full result again
        </Link>
      </p>
    </section>
  );
}
