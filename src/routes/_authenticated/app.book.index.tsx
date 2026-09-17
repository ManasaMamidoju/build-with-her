import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BOOKABLE, bookableBySlug, formatWhen } from "@/lib/booking-options";
import { cancelBooking, getMyBookings } from "@/lib/booking.functions";
import { getMyScores } from "@/lib/member.functions";

export const Route = createFileRoute("/_authenticated/app/book/")({
  head: () => ({
    meta: [
      { title: "Book a session | Build With Her Media" },
      { name: "description", content: "Pick a time for your clarity call or strategy consult." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookIndex,
});

function BookIndex() {
  const listFn = useServerFn(getMyBookings);
  const cancelFn = useServerFn(cancelBooking);
  const scoresFn = useServerFn(getMyScores);
  const { data, refetch } = useQuery({ queryKey: ["my-bookings"], queryFn: () => listFn({}) });
  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ["my-scores"],
    queryFn: () => scoresFn(),
  });

  async function cancel(id: string) {
    try {
      await cancelFn({ data: { id } });
      toast.success("Cancelled");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not cancel that.");
    }
  }

  const upcoming = (data ?? []).filter(
    (row) => row.status !== "cancelled" && new Date(row.starts_at).getTime() > Date.now(),
  );

  const hasScore = (scores?.length ?? 0) > 0;

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl">Book a session</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Pick the session you want, answer three short questions, and choose a time that suits you.
      </p>

      {!scoresLoading && !hasScore ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-6">
          <h2 className="text-xl">Take the Findability Score first</h2>
          <p className="mt-2 text-base text-muted-foreground">
            We read your score on the call, so we book you in once we know where to start.
          </p>
          <Button asChild className="mt-5">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {BOOKABLE.map((service) => (
          <div
            key={service.slug}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-xl">{service.name}</h2>
            <p className="mt-2 text-base text-muted-foreground">{service.blurb}</p>
            <p className="mt-2 text-sm text-muted-foreground">{service.durationMinutes} minutes</p>
            {hasScore ? (
              <Button asChild className="mt-5">
                <Link to="/app/book/$slug" params={{ slug: service.slug }}>
                  Choose a time
                </Link>
              </Button>
            ) : (
              <Button asChild className="mt-5">
                <Link to="/score/quiz">Take the score first</Link>
              </Button>
            )}
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Your booked sessions</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border p-6 text-base text-muted-foreground">
            Nothing booked yet. Once you book, the time shows here and you can move it or cancel it
            up to 24 hours before.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {upcoming.map((row) => (
              <li key={row.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <p className="text-base font-medium">
                  {bookableBySlug(row.service_slug)?.name ?? row.service_slug}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{formatWhen(row.starts_at)}</p>
                {row.meet_link ? (
                  <a
                    href={row.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-primary underline"
                  >
                    Join by Google Meet
                  </a>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/book/$slug" params={{ slug: row.service_slug }}>
                      Pick a different time
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => cancel(row.id)}>
                    Cancel this session
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
