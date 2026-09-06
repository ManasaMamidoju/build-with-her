import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoseMark } from "@/components/brand/RoseMark";
import { getMyOverview, getMyScores } from "@/lib/member.functions";
import { bookableBySlug, formatWhen } from "@/lib/booking-options";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Your dashboard | Build With Her Media" },
      { name: "description", content: "Your Findability Score, your next step, and your sessions." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const overviewFn = useServerFn(getMyOverview);
  const scoresFn = useServerFn(getMyScores);

  const overview = useQuery({ queryKey: ["my-overview"], queryFn: () => overviewFn({}) });
  const scores = useQuery({ queryKey: ["my-scores"], queryFn: () => scoresFn({}) });

  const latest = scores.data?.[0];
  const firstName = overview.data?.profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <main className="container-editorial max-w-4xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Your dashboard</p>
      </div>
      <h1 className="mt-4 text-3xl">Hello {firstName}</h1>

      <section className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
        <h2 className="text-2xl">Your Findability Score</h2>
        {scores.isLoading ? (
          <p className="mt-3 text-base text-muted-foreground">Fetching your score.</p>
        ) : latest ? (
          <>
            <p className="numeric mt-3 font-display text-6xl leading-none text-primary">
              {latest.total}
              <span className="text-xl text-muted-foreground"> / 100</span>
            </p>
            <p className="mt-2 text-lg">{latest.band}</p>
            <Progress value={latest.total} className="mt-4 h-2" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/app/score">See your five areas</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/score/r/$token" params={{ token: latest.token }}>
                  Open your results page
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-base text-muted-foreground">
              You have not taken the questions yet. It takes three minutes and it tells us what to
              fix first.
            </p>
            <Button asChild className="mt-6">
              <Link to="/score/quiz">Take the quiz</Link>
            </Button>
          </>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-blush p-8 shadow-card">
        <h2 className="text-2xl">Your next step</h2>
        <p className="mt-3 text-base text-muted-foreground">
          {latest
            ? latest.topFixes[0]?.fix ??
              "Nothing is badly broken. Book a call and we will plan what to build next."
            : "Take the questions, then book a free clarity call so we read the result together."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/app/book">Book a session</Link>
        </Button>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
        <h2 className="text-2xl">Your work with us</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Every project we are running for you, the step it is on, and anything waiting on your
          approval.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/app/projects">See your work</Link>
        </Button>
      </section>



      <section className="mt-8">
        <h2 className="text-2xl">Your sessions</h2>
        {overview.data && overview.data.bookings.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {overview.data.bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <p className="text-base font-medium">
                  {bookableBySlug(booking.service_slug)?.name ?? booking.service_slug}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWhen(booking.starts_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-border p-6 text-base text-muted-foreground">
            Nothing booked yet. When you book, the time shows here with a link to move or cancel it.
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <h3 className="text-xl">The community</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Women running real businesses, comparing what actually works.
          </p>
          <Link to="/community" className="mt-4 inline-block text-sm text-primary">
            See how to join
          </Link>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <h3 className="text-xl">Learn it yourself</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Plain explainers for each of the five areas, free to read.
          </p>
          <Link to="/learn" className="mt-4 inline-block text-sm text-primary">
            Read the explainers
          </Link>
        </div>
      </section>
    </main>
  );
}
