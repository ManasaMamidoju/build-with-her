import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listMyAssignments, updateMyAssignment } from "@/lib/projects.functions";
import { deliverableStageLabel } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/admin/queue")({
  head: () => ({
    meta: [
      { title: "My editing queue | Build With Her Media studio" },
      { name: "description", content: "The pieces assigned to you and what is due first." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditorQueue,
});

function EditorQueue() {
  const fetchAssignments = useServerFn(listMyAssignments);
  const update = useServerFn(updateMyAssignment);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my", "assignments"],
    queryFn: () => fetchAssignments(),
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; editedUrl?: string; stage?: "editing" | "team_review" }) =>
      update({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["my", "assignments"] });
    },
    onError: () => toast.error("That did not save. Try again."),
  });

  const rows = data ?? [];

  return (
    <div>
      <h1 className="text-3xl">My editing queue</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Only the pieces assigned to you, soonest due first. Drop your edited link in and hand it
        back for review.
      </p>

      {isLoading ? <p className="mt-8 text-muted-foreground">Fetching your queue.</p> : null}

      {!isLoading && rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-xl">Nothing assigned to you yet</h2>
          <p className="mt-2 text-base text-muted-foreground">
            When a piece is handed to you it lands here with its footage link and its due date.
          </p>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{deliverableStageLabel(item.stage)}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                item.projectName,
                item.person?.full_name,
                item.editor_due_at
                  ? `due ${new Date(item.editor_due_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`
                  : "no date set",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {item.team_notes ? (
              <p className="mt-3 text-base text-muted-foreground">{item.team_notes}</p>
            ) : null}

            {item.raw_url ? (
              <a
                className="mt-3 inline-block text-sm underline"
                href={item.raw_url}
                target="_blank"
                rel="noreferrer"
              >
                Open the footage
              </a>
            ) : null}

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1">
                <Label htmlFor={`edited-${item.id}`}>Your edited link</Label>
                <Input
                  id={`edited-${item.id}`}
                  className="mt-2"
                  defaultValue={item.edited_url ?? ""}
                  onBlur={(event) =>
                    mutation.mutate({ id: item.id, editedUrl: event.target.value })
                  }
                />
              </div>
              <Button
                variant="outline"
                onClick={() => mutation.mutate({ id: item.id, stage: "team_review" })}
                disabled={mutation.isPending}
              >
                Hand it back for review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
