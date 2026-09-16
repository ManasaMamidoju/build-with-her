import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookableBySlug, formatDay, formatTime } from "@/lib/booking-options";
import { createBooking, getAvailability } from "@/lib/booking.functions";
import { getMyScores } from "@/lib/member.functions";

export const Route = createFileRoute("/_authenticated/app/book/$slug")({
  loader: ({ params }) => {
    const service = bookableBySlug(params.slug);
    if (!service) throw notFound();
    return { slug: params.slug };
  },
  head: () => ({
    meta: [
      { title: "Choose a time | Build With Her Media" },
      { name: "description", content: "Answer three short questions and pick a time." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookService,
  notFoundComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">That session cannot be booked here</h1>
      <Button asChild className="mt-8">
        <Link to="/app/book">See what you can book</Link>
      </Button>
    </main>
  ),
});

function BookService() {
  const { slug } = Route.useLoaderData();
  const service = bookableBySlug(slug)!;
  const navigate = useNavigate();

  const availabilityFn = useServerFn(getAvailability);
  const createFn = useServerFn(createBooking);
  const scoresFn = useServerFn(getMyScores);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ["my-scores"],
    queryFn: () => scoresFn(),
  });
  const hasScore = (scores?.length ?? 0) > 0;

  const { data: slots, isLoading } = useQuery({
    queryKey: ["availability", service.durationMinutes],
    queryFn: () => availabilityFn({ data: { durationMinutes: service.durationMinutes } }),
    enabled: hasScore,
  });

  const byDay = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const slot of slots ?? []) {
      const day = formatDay(slot.startsAt);
      groups.set(day, [...(groups.get(day) ?? []), slot.startsAt]);
    }
    return [...groups.entries()];
  }, [slots]);

  const missingRequired = service.intake.some(
    (question) => question.required && !(answers[question.id] ?? "").trim(),
  );

  async function book() {
    if (!chosen) return;
    setSaving(true);
    try {
      await createFn({
        data: {
          serviceSlug: service.slug,
          startsAt: chosen,
          durationMinutes: service.durationMinutes,
          intake: answers,
        },
      });
      toast.success("Your session is booked");
      navigate({ to: "/app/book" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not book that time.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <h1 className="text-3xl">{service.name}</h1>
      <p className="mt-3 text-base text-muted-foreground">{service.blurb}</p>
      {service.paymentNote ? (
        <p className="mt-4 rounded-2xl bg-blush p-5 text-base">{service.paymentNote}</p>
      ) : null}

      {!scoresLoading && !hasScore ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-6">
          <h2 className="text-xl">Take the Findability Score first</h2>
          <p className="mt-2 text-base text-muted-foreground">
            We read your score on the call, so booking opens once you have taken it.
          </p>
          <Button asChild className="mt-5">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="mt-10 space-y-6">
            <h2 className="text-2xl">Tell us what to prepare</h2>
            {service.intake.map((question) => (
              <div key={question.id}>
                <Label htmlFor={question.id}>{question.label}</Label>
                {question.helper ? (
                  <p className="mt-1 text-sm text-muted-foreground">{question.helper}</p>
                ) : null}
                {question.long ? (
                  <Textarea
                    id={question.id}
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                    }
                    className="mt-2 min-h-24"
                  />
                ) : (
                  <Input
                    id={question.id}
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                    }
                    className="mt-2 h-12"
                  />
                )}
              </div>
            ))}
          </section>

          <section className="mt-12">
            <h2 className="text-2xl">Pick a time</h2>
            {isLoading ? (
              <p className="mt-4 text-base text-muted-foreground">Fetching open times.</p>
            ) : byDay.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-border p-6 text-base text-muted-foreground">
                No open times in the next three weeks. Email us and we will make room for you.
              </p>
            ) : (
              <div className="mt-6 space-y-6">
                {byDay.map(([day, times]) => (
                  <div key={day}>
                    <p className="text-base font-medium">{day}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {times.map((time) => (
                        <Button
                          key={time}
                          variant={chosen === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChosen(time)}
                        >
                          {formatTime(time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Button
            size="lg"
            className="mt-10 h-12 px-7 text-base"
            disabled={!chosen || missingRequired || saving}
            onClick={book}
          >
            {saving ? "Booking your time" : "Book this session"}
          </Button>
          {missingRequired ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Answer the first question and the button turns on.
            </p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            You can move or cancel this once, up to 24 hours before. Confirmation emails start going
            out as soon as our email sending is live.
          </p>
        </>
      )}
    </main>
  );
}
