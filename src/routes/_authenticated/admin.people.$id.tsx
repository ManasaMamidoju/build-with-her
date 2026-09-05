import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addPersonNote, getPerson, setLeadStage } from "@/lib/admin.functions";
import { formatWhen } from "@/lib/booking-options";

const STAGES = ["new", "contacted", "call_booked", "proposal", "client", "past"] as const;

export const Route = createFileRoute("/_authenticated/admin/people/$id")({
  head: () => ({
    meta: [
      { title: "Person | Build With Her Media studio" },
      { name: "description", content: "Everything we know about her, in one place." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const fetchPerson = useServerFn(getPerson);
  const noteFn = useServerFn(addPersonNote);
  const stageFn = useServerFn(setLeadStage);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "person", id],
    queryFn: () => fetchPerson({ data: { id } }),
  });

  const saveNote = useMutation({
    mutationFn: () => noteFn({ data: { profileId: id, body: note } }),
    onSuccess: () => {
      setNote("");
      toast.success("Note saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "person", id] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "We could not save that note."),
  });

  const moveStage = useMutation({
    mutationFn: (stage: (typeof STAGES)[number]) => stageFn({ data: { profileId: id, stage } }),
    onSuccess: () => {
      toast.success("Moved");
      queryClient.invalidateQueries({ queryKey: ["admin", "person", id] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "We could not move her."),
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

  const { profile, handles, notes, bookings, scores, touchpoints } = data;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl">{profile.full_name ?? profile.email ?? "No name yet"}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {[profile.business_name, profile.email, profile.phone].filter(Boolean).join(" \u00b7 ")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Came from {profile.primary_source ?? "unknown"}
        </p>
      </header>

      <section>
        <h2 className="text-xl">Where she is</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => moveStage.mutate(stage)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                profile.lead_stage === stage
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {stage.replace("_", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl">Scores</h2>
          {scores.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">She has not taken it yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {scores.map((score) => (
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
              {bookings.map((booking) => (
                <li key={booking.id}>
                  {formatWhen(booking.starts_at)}, {booking.service_slug}, {booking.status}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl">Where she posts</h2>
          {handles.length === 0 ? (
            <p className="mt-3 text-base text-muted-foreground">Nothing on file.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              {handles.map((handle) => (
                <li key={handle.platform}>
                  {handle.platform}: {handle.handle}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl">What she agreed to</h2>
          <ul className="mt-3 space-y-2 text-base text-muted-foreground">
            <li>Email: {profile.consent_email ? "yes" : "no"}</li>
            <li>Text messages: {profile.consent_sms ? "yes" : "no"}</li>
            <li>Community: {profile.consent_community ? "yes" : "no"}</li>
          </ul>
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
            {notes.map((entry) => (
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
            {touchpoints.map((point) => (
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
