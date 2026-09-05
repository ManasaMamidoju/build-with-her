import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { getAdminToday } from "@/lib/admin.functions";
import { formatWhen } from "@/lib/booking-options";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Studio today | Build With Her Media" },
      { name: "description", content: "Sessions, new scores and new sign ups." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminToday,
});

function AdminToday() {
  const fetchToday = useServerFn(getAdminToday);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "today"],
    queryFn: () => fetchToday(),
  });

  if (isLoading) return <p className="text-base text-muted-foreground">Loading</p>;

  if (error) {
    return (
      <div className="rounded-2xl border border-border p-8">
        <h1 className="text-2xl">This area is for the studio team</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your account does not have studio access. If that is wrong, tell Manasa.
        </p>
        <Button asChild className="mt-6">
          <Link to="/app">Go to my dashboard</Link>
        </Button>
      </div>
    );
  }

  const today = data!;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow text-primary">Studio</p>
        <h1 className="mt-2 text-3xl">Today</h1>
      </header>

      <section>
        <h2 className="text-xl">Sessions in the next seven days</h2>
        {today.bookings.length === 0 ? (
          <p className="mt-3 text-base text-muted-foreground">
            Nothing booked yet. Every score result invites her to book a clarity call.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {today.bookings.map((booking) => (
              <li key={booking.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="numeric text-base">{formatWhen(booking.starts_at)}</p>
                <p className="mt-1 text-base text-muted-foreground">{booking.service_slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl">Newest scores</h2>
        {today.scores.length === 0 ? (
          <p className="mt-3 text-base text-muted-foreground">No scores yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {today.scores.map((score) => (
              <li key={score.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-base">
                  {score.full_name}
                  {score.business_name ? `, ${score.business_name}` : ""}
                </p>
                <p className="numeric mt-1 text-base text-primary">
                  {score.total_score} out of 100, {score.band}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{score.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl">Waiting for the bootcamp</h2>
          {today.waitlists.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">Nobody yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-base text-muted-foreground">
              {today.waitlists.map((row) => (
                <li key={row.id}>
                  {row.full_name}, {row.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl">Signed in at events</h2>
          {today.attendees.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">Nobody yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-base text-muted-foreground">
              {today.attendees.map((row) => (
                <li key={row.id}>
                  {row.full_name ?? row.email}
                  {row.business_name ? `, ${row.business_name}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        <Link to="/admin/people" className="text-primary hover:underline">
          Open the people list
        </Link>
      </p>
    </div>
  );
}
