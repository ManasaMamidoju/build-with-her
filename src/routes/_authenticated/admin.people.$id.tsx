import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addPersonRecordNote, getPersonRecord } from "@/lib/people.functions";
import { formatWhen } from "@/lib/booking-options";

const IDENTITY_LABEL: Record<string, string> = {
  email: "Email on file",
  handle: "Handle on file",
  name_only: "Name only",
};

export const Route = createFileRoute("/_authenticated/admin/people/$id")({
  head: () => ({
    meta: [
      { title: "Person | Build With Her Media studio" },
      { name: "description", content: "Everything we know about her, in one place." },
      { property: "og:title", content: "Person | Build With Her Media studio" },
      { property: "og:description", content: "Everything we know about her, in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const fetchPerson = useServerFn(getPersonRecord);
  const noteFn = useServerFn(addPersonRecordNote);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "person", id],
    queryFn: () => fetchPerson({ data: { id } }),
  });

  const saveNote = useMutation({
    mutationFn: () => noteFn({ data: { personId: data!.person.id, body: note } }),
    onSuccess: () => {
      setNote("");
      toast.success("Note saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "person", id] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "We could not save that note."),
  });

  if (isLoading) return <p className="text-base text-muted-foreground">Loading</p>;
  if (!data) {
    return (
      <div>
        <h1 className="text-2xl">We cannot find her</h1>
        <Button asChild className="mt-6">
          <Link to="/admin/people">Back to people</Link>
        </Button>
      </div>
    );
  }

  const {
    person,
    handles,
    notes,
    interviews,
    scores,
    touchpoints,
    waitlists,
    applications,
    bookings,
  } = data;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl">{person.full_name ?? person.email ?? "No name yet"}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {[person.business_name, person.email, person.phone, person.city]
            .filter(Boolean)
            .join(" \u00b7 ")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Tag>{IDENTITY_LABEL[person.identity_status] ?? person.identity_status}</Tag>
          <Tag>Pipeline: {(person.lead_stage ?? "new").replace("_", " ")}</Tag>
          <Tag>{person.profile_id ? "Signed in" : "Has not signed in"}</Tag>
          <Tag>Came from {person.primary_source ?? "unknown"}</Tag>
          {person.consent_confirmed ? <Tag>Consent confirmed</Tag> : null}
          {person.blocked ? <Tag>Blocked</Tag> : null}
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl">Where she posts</h2>
          {handles.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">Nothing on file.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {handles.map((handle: any) => (
                <li key={handle.id}>
                  {handle.platform}: {handle.handle}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl">Her interview</h2>
          {interviews.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">She has not filmed with us.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {interviews.map((interview: any) => (
                <li key={interview.id}>
                  {[interview.event_name, interview.interview_date].filter(Boolean).join(", ")}
                  {" \u00b7 "}
                  {interview.overall_status || "No status"}
                  {interview.approved_for_posting ? ", approved to post" : ""}
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/interviews" className="mt-3 inline-block text-sm text-primary hover:underline">
            Update interview details
          </Link>
        </div>

        <div>
          <h2 className="text-xl">Scores</h2>
          {scores.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">She has not taken it yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {scores.map((score: any) => (
                <li key={score.id} className="numeric">
                  {score.total_score} out of 100, {score.band}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl">Sessions</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">No sessions booked.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {bookings.map((booking: any) => (
                <li key={booking.id}>
                  {formatWhen(booking.starts_at)}, {booking.service_slug}, {booking.status}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl">Waiting lists</h2>
          {waitlists.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">Not on any list.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {waitlists.map((row: any) => (
                <li key={row.id}>{row.service_slug}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl">Podcast</h2>
          {applications.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">No application yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {applications.map((row: any) => (
                <li key={row.id}>
                  {row.format}, {row.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl">Notes</h2>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What happened on the call?"
          className="mt-3 min-h-24"
        />
        <Button
          className="mt-3"
          disabled={!note.trim() || saveNote.isPending}
          onClick={() => saveNote.mutate()}
        >
          {saveNote.isPending ? "Saving" : "Save this note"}
        </Button>
        {notes.length === 0 ? (
          <p className="mt-5 text-base text-muted-foreground">
            No notes yet. Write what she asked for so the next call starts warm.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {notes.map((entry: any) => (
              <li key={entry.id} className="rounded-2xl border border-border p-4">
                <p className="text-base">{entry.body}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatWhen(entry.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl">Everything she has done</h2>
        {touchpoints.length === 0 ? (
          <p className="mt-3 text-base text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {touchpoints.map((point: any) => (
              <li key={point.id}>
                {formatWhen(point.created_at)}: {point.kind}
                {point.source ? `, from ${point.source}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        <Link to="/admin/people" className="text-primary hover:underline">
          Back to people
        </Link>
      </p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{children}</span>
  );
}
