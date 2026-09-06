import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMyProject, reviewDeliverable } from "@/lib/projects.functions";
import { deliverableStageLabel, projectTypeLabel } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/app/projects/$id")({
  head: () => ({
    meta: [
      { title: "Your project | Build With Her Media" },
      { name: "description", content: "Your steps, your pieces, and what needs your approval." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyProject,
});

function MyProject() {
  const { id } = Route.useParams();
  const fetchProject = useServerFn(getMyProject);
  const review = useServerFn(reviewDeliverable);
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["my", "project", id],
    queryFn: () => fetchProject({ data: { id } }),
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; action: "approve" | "request_revision"; comment?: string }) =>
      review({ data: input }),
    onSuccess: (_result, input) => {
      toast.success(
        input.action === "approve" ? "Approved. Thank you." : "Sent back with your notes.",
      );
      queryClient.invalidateQueries({ queryKey: ["my", "project", id] });
      queryClient.invalidateQueries({ queryKey: ["my", "projects"] });
    },
    onError: (error: Error) => toast.error(error.message || "That did not send."),
  });

  if (isLoading) {
    return <p className="container-editorial py-12 text-muted-foreground">Fetching your project.</p>;
  }

  if (!data) {
    return (
      <div className="container-editorial py-12">
        <h1 className="text-3xl">We cannot find that project</h1>
        <Button asChild className="mt-6">
          <Link to="/app/projects">Back to your work</Link>
        </Button>
      </div>
    );
  }

  const project = data.project as any;

  return (
    <div className="container-editorial py-12">
      <Link to="/app/projects" className="text-sm text-muted-foreground underline">
        Back to your work
      </Link>
      <h1 className="mt-3 text-4xl">{project.name}</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {projectTypeLabel(project.type)}
        {project.stage ? ` · on ${project.stage}` : ""}
        {project.due_at
          ? ` · due ${new Date(project.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`
          : ""}
      </p>

      <section className="mt-10">
        <h2 className="text-2xl">Where we are</h2>
        <ol className="mt-4 space-y-2">
          {(data.stages ?? []).map((stage: any, index: number) => (
            <li
              key={stage.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                stage.status === "doing" ? "border-primary bg-blush" : "border-border bg-card"
              }`}
            >
              <span className="text-base">
                {index + 1}. {stage.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {stage.status === "done"
                  ? "Done"
                  : stage.status === "doing"
                    ? "Happening now"
                    : "To come"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Your pieces</h2>
        <p className="prose-editorial mt-2 text-base text-muted-foreground">
          When a piece is ready for you, watch it and either approve it or ask for your changes. One
          round of changes is included with each piece.
        </p>

        {(data.deliverables ?? []).length === 0 ? (
          <p className="mt-4 text-base text-muted-foreground">
            Nothing to watch yet. We will email you the moment the first piece is ready.
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {(data.deliverables ?? []).map((item: any) => {
            const waitingOnHer = item.stage === "client_review";
            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {deliverableStageLabel(item.stage)}
                  </p>
                </div>

                {item.team_notes ? (
                  <p className="prose-editorial mt-3 text-base text-muted-foreground">
                    {item.team_notes}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {item.final_url ? (
                    <a className="underline" href={item.final_url} target="_blank" rel="noreferrer">
                      Watch it
                    </a>
                  ) : null}
                  {item.published_url ? (
                    <a
                      className="underline"
                      href={item.published_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      See it posted
                    </a>
                  ) : null}
                </div>

                {waitingOnHer ? (
                  <div className="mt-5 border-t border-border pt-5">
                    {item.review_due_at ? (
                      <p className="text-sm text-muted-foreground">
                        Please reply by{" "}
                        {new Date(item.review_due_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })}
                        .
                      </p>
                    ) : null}
                    <Textarea
                      rows={3}
                      className="mt-3"
                      placeholder="If you want changes, tell us exactly what to change."
                      value={comments[item.id] ?? ""}
                      onChange={(event) =>
                        setComments((prev) => ({ ...prev, [item.id]: event.target.value }))
                      }
                    />
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            action: "approve",
                            comment: comments[item.id] ?? "",
                          })
                        }
                        disabled={mutation.isPending}
                      >
                        Approve this piece
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            action: "request_revision",
                            comment: comments[item.id] ?? "",
                          })
                        }
                        disabled={mutation.isPending || !(comments[item.id] ?? "").trim()}
                      >
                        Ask for changes
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Changes used: {item.revisions_used ?? 0} of {item.revisions_allowed ?? 1}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
