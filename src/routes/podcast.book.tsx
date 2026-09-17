import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { RoseMark } from "@/components/brand/RoseMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PODCAST_BOOKABLE,
  formatDay,
  formatTime,
  podcastBookableBySlug,
} from "@/lib/booking-options";
import { createPodcastBooking, getPodcastAvailability } from "@/lib/podcast-booking.functions";
import { canonical } from "@/lib/site";
import { getCapturedSource } from "@/lib/source-capture";

const searchSchema = z.object({
  slug: z.enum(["podcast-street", "podcast-longform"]).optional(),
});

export const Route = createFileRoute("/podcast/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book a podcast slot | Build With Her Media" },
      {
        name: "description",
        content:
          "Pick an open time for a street-style or long-form podcast slot. No sign-in, no score required.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: canonical("/podcast/book") }],
  }),
  component: PodcastBook,
});

function PodcastBook() {
  const { slug: preselected } = Route.useSearch();
  const [slug, setSlug] = useState<(typeof PODCAST_BOOKABLE)[number]["slug"]>(
    preselected ?? PODCAST_BOOKABLE[0]!.slug,
  );
  const service = podcastBookableBySlug(slug)!;

  const availabilityFn = useServerFn(getPodcastAvailability);
  const bookFn = useServerFn(createPodcastBooking);

  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    instagram: "",
  });

  const { data: slots, isLoading } = useQuery({
    queryKey: ["podcast-availability", slug],
    queryFn: () => availabilityFn({ data: { slug } }),
  });

  const byDay = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const slot of slots ?? []) {
      const day = formatDay(slot.startsAt);
      groups.set(day, [...(groups.get(day) ?? []), slot.startsAt]);
    }
    return [...groups.entries()];
  }, [slots]);

  async function book() {
    if (!chosen || !form.fullName.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      await bookFn({
        data: {
          slug,
          startsAt: chosen,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          instagram: form.instagram,
          source: getCapturedSource()?.src ?? "direct",
        },
      });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not book that time.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <main className="container-editorial max-w-2xl py-20 text-center">
        <RoseMark className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-6 text-3xl">You are booked</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Check your email for the details. We will be in touch beforehand with what to bring.
        </p>
        <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
          <Link to="/podcast">Back to the podcast</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <p className="eyebrow text-primary">The podcast</p>
      <h1 className="mt-3 text-3xl">Book your slot</h1>
      <p className="mt-3 text-base text-muted-foreground">
        No sign-in and no score needed for this one. Pick a format, pick a time, and tell us how to
        reach you.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {PODCAST_BOOKABLE.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() => {
              setSlug(option.slug);
              setChosen(null);
            }}
            className={`rounded-full px-4 py-2 text-sm ${
              slug === option.slug
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{service.blurb}</p>

      <section className="mt-10">
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

      <section className="mt-10 grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="pb-name">Your name</Label>
            <Input
              id="pb-name"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="pb-email">Email</Label>
            <Input
              id="pb-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="pb-business">Business name</Label>
            <Input
              id="pb-business"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="pb-phone">Phone</Label>
            <Input
              id="pb-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="pb-instagram">Instagram</Label>
            <Input
              id="pb-instagram"
              value={form.instagram}
              onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
        </div>
      </section>

      <Button
        size="lg"
        className="mt-8 h-12 px-7 text-base"
        disabled={!chosen || !form.fullName.trim() || !form.email.trim() || saving}
        onClick={book}
      >
        {saving ? "Booking your slot" : "Book this slot"}
      </Button>
    </main>
  );
}
