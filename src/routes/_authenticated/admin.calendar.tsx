import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { bookableBySlug, formatDay, formatTime } from "@/lib/booking-options";
import { getStudioCalendar } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar | Build With Her Media" },
      { name: "description", content: "Your booked sessions, week by week." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Calendar,
});

function startOfWeek(offsetWeeks: number) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const calendarFn = useServerFn(getStudioCalendar);

  const from = startOfWeek(weekOffset);
  const to = new Date(from.getTime() + 7 * 86400000);

  const { data, isLoading } = useQuery({
    queryKey: ["studio-calendar", from.toISOString()],
    queryFn: () => calendarFn({ data: { fromIso: from.toISOString(), toIso: to.toISOString() } }),
  });

  const days = Array.from({ length: 7 }, (_, index) => new Date(from.getTime() + index * 86400000));
  const rows = (data ?? []).filter((row) => row.status !== "cancelled");

  return (
    <div>
      <h1 className="text-3xl">Calendar</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Everything booked this week. Click a name to open her page.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((n) => n - 1)}>
          Week before
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
          This week
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((n) => n + 1)}>
          Week after
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading your week.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => {
            const iso = day.toDateString();
            const inDay = rows.filter((row) => new Date(row.starts_at).toDateString() === iso);
            return (
              <section key={iso} className="rounded-2xl border border-border bg-card p-4">
                <h2 className="text-base font-medium">{formatDay(day.toISOString())}</h2>
                {inDay.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nothing booked.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {inDay.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        <p className="numeric text-sm">{formatTime(row.starts_at)}</p>
                        <Link
                          to="/admin/people/$id"
                          params={{ id: row.user_id }}
                          className="mt-1 block text-sm font-medium underline-offset-4 hover:underline"
                        >
                          {row.personName}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {bookableBySlug(row.service_slug)?.name ?? row.service_slug}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
