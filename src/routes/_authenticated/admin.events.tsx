import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatWhen } from "@/lib/booking-options";
import { SITE } from "@/lib/site";
import { listEventAttendees, listStudioEvents, saveStudioEvent } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({
    meta: [
      { title: "Events | Build With Her Media" },
      { name: "description", content: "Create events, print the sign-in code, export who came." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StudioEvents,
});

type StudioEvent = {
  id: string;
  slug: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  city: string | null;
  description: string | null;
  published: boolean;
  attendeeCount: number;
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function signInUrl(slug: string) {
  return `${SITE.url}/e/${slug}`;
}

function StudioEvents() {
  const listFn = useServerFn(listStudioEvents);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["studio-events"],
    queryFn: () => listFn({}),
  });

  const [editing, setEditing] = useState<StudioEvent | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Events</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Each event has its own sign-in page and a code you can print and put on the table.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          Add an event
        </Button>
      </div>

      {creating || editing ? (
        <EventForm
          event={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
            refetch();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading your events.</p>
      ) : (data ?? []).length === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          No events yet. Add one and you get a page women can sign in on in under a minute.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {(data ?? []).map((event) => (
            <EventCard
              key={event.id}
              event={event as StudioEvent}
              onEdit={() => {
                setCreating(false);
                setEditing(event as StudioEvent);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EventCard({ event, onEdit }: { event: StudioEvent; onEdit: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [showAttendees, setShowAttendees] = useState(false);
  const attendeesFn = useServerFn(listEventAttendees);
  const { data: attendees } = useQuery({
    queryKey: ["event-attendees", event.id],
    queryFn: () => attendeesFn({ data: { eventId: event.id } }),
    enabled: showAttendees,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(signInUrl(event.slug), { width: 512, margin: 1 });
      if (!cancelled) setQr(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [event.slug]);

  function download() {
    const rows = attendees ?? [];
    const header = ["Name", "Email", "Business", "Email opt in", "Text opt in", "Signed in"];
    const lines = rows.map((row) => [
      row.full_name ?? "",
      row.email ?? "",
      row.business_name ?? "",
      row.consent_email ? "yes" : "no",
      row.consent_sms ? "yes" : "no",
      new Date(row.created_at).toLocaleString(),
    ]);
    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.slug}-sign-ins.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-xl">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(event.starts_at).toLocaleString()} {event.venue ? `at ${event.venue}` : ""}{" "}
            {event.city ?? ""}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {event.published ? "Showing on your events page" : "Hidden from your events page"} ·{" "}
            <span className="numeric">{event.attendeeCount}</span> signed in
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{signInUrl(event.slug)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit this event
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAttendees((v) => !v)}>
              {showAttendees ? "Hide who came" : "See who came"}
            </Button>
            {qr ? (
              <Button asChild size="sm" variant="outline">
                <a href={qr} download={`${event.slug}-qr.png`}>
                  Download the code to print
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        {qr ? (
          <img
            src={qr}
            alt={`Sign-in code for ${event.title}`}
            className="h-32 w-32 rounded-xl border border-border bg-background p-2"
          />
        ) : null}
      </div>

      {showAttendees ? (
        <div className="mt-6 border-t border-border pt-6">
          {(attendees ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nobody has signed in yet. Put the printed code where women can see it.
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {(attendees ?? []).map((row) => (
                  <li key={row.id} className="text-sm">
                    <span className="font-medium">{row.full_name ?? row.email}</span>{" "}
                    <span className="text-muted-foreground">
                      {row.business_name ?? ""} {row.email}
                    </span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-4" onClick={download}>
                Download as a spreadsheet
              </Button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}

function EventForm({
  event,
  onDone,
  onCancel,
}: {
  event: StudioEvent | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const saveFn = useServerFn(saveStudioEvent);
  const [form, setForm] = useState({
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    startsAt: toLocalInput(event?.starts_at ?? null),
    endsAt: toLocalInput(event?.ends_at ?? null),
    venue: event?.venue ?? "",
    city: event?.city ?? "",
    description: event?.description ?? "",
    published: event?.published ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.startsAt) {
      toast.error("Pick when it starts.");
      return;
    }
    setSaving(true);
    try {
      await saveFn({
        data: {
          id: event?.id ?? null,
          slug: form.slug.trim().toLowerCase(),
          title: form.title.trim(),
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          venue: form.venue.trim(),
          city: form.city.trim(),
          description: form.description.trim(),
          published: form.published,
        },
      });
      toast.success("Event saved");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-blush p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="title">What it is called</Label>
        <Input
          id="title"
          className="mt-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="slug">Short name for the link</Label>
        <Input
          id="slug"
          className="mt-2"
          placeholder="miami-beauty-weekend"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          className="mt-2"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="startsAt">Starts</Label>
        <Input
          id="startsAt"
          type="datetime-local"
          className="mt-2"
          value={form.startsAt}
          onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="endsAt">Finishes</Label>
        <Input
          id="endsAt"
          type="datetime-local"
          className="mt-2"
          value={form.endsAt}
          onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="venue">Where</Label>
        <Input
          id="venue"
          className="mt-2"
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="description">A few lines about it</Label>
        <Textarea
          id="description"
          rows={4}
          className="mt-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-3 text-sm md:col-span-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Show this on the public events page
      </label>
      <div className="flex gap-3 md:col-span-2">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving" : "Save this event"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
