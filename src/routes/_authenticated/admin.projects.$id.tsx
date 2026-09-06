import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getProjectForTeam,
  saveDeliverable,
  saveProject,
  setStageStatus,
} from "@/lib/projects.functions";
import { DELIVERABLE_LABELS, DELIVERABLE_STAGES, projectTypeLabel } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/admin/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project | Build With Her Media studio" },
      { name: "description", content: "The steps, the deliverables and where each one stands." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const fetchProject = useServerFn(getProjectForTeam);
  const stageStatus = useServerFn(setStageStatus);
  const persistProject = useServerFn(saveProject);
  const persistDeliverable = useServerFn(saveDeliverable);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "project", id],
    queryFn: () => fetchProject({ data: { id } }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "project", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
  };

  const stageMutation = useMutation({
    mutationFn: (input: { stageId: string; status: string }) =>
      stageStatus({ data: { stageId: input.stageId, status: input.status as any } }),
    onSuccess: invalidate,
    onError: () => toast.error("That did not save."),
  });

  const projectMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) => persistProject({ data: { id, ...input } as any }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: () => toast.error("That did not save."),
  });

  const deliverableMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) => persistDeliverable({ data: input as any }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: () => toast.error("That did not save."),
  });

  if (isLoading) return <p className="text-muted-foreground">Fetching this project.</p>;
  if (!data) {
    return (
      <div>
        <h1 className="text-3xl">We cannot find that project</h1>
        <Button asChild className="mt-6">
          <Link to="/admin/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const project = data.project as any;

  return (
    <div>
      <Link to="/admin/projects" className="text-sm text-muted-foreground underline">
        Back to projects
      </Link>
      <h1 className="mt-3 text-3xl">{project.name}</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {projectTypeLabel(project.type)}
        {data.person?.full_name ? ` · ${data.person.full_name}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border p-5">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            defaultValue={project.status}
            onChange={(event) => projectMutation.mutate({ status: event.target.value })}
            className="mt-2 block h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <Label htmlFor="due">Due date</Label>
          <Input
            id="due"
            type="date"
            className="mt-2"
            defaultValue={project.due_at ? String(project.due_at).slice(0, 10) : ""}
            onBlur={(event) =>
              projectMutation.mutate({ dueAt: event.target.value ? event.target.value : null })
            }
          />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Steps</h2>
        <ol className="mt-4 space-y-2">
          {(data.stages ?? []).map((stage: any) => (
            <li
              key={stage.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="text-base">
                {stage.position}. {stage.name}
              </span>
              <select
                value={stage.status}
                onChange={(event) =>
                  stageMutation.mutate({ stageId: stage.id, status: event.target.value })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="pending">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
                <option value="skipped">Skipped</option>
              </select>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Deliverables</h2>
        <p className="mt-2 text-base text-muted-foreground">
          What she sees and approves. Move a deliverable to her review when the link is in.
        </p>
        <div className="mt-4 space-y-3">
          {(data.deliverables ?? []).map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-medium">{item.title}</p>
                <select
                  value={item.status}
                  onChange={(event) =>
                    deliverableMutation.mutate({ id: item.id, status: event.target.value })
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {DELIVERABLE_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {DELIVERABLE_LABELS[stage]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`draft-${item.id}`}>Draft link</Label>
                  <Input
                    id={`draft-${item.id}`}
                    className="mt-2"
                    defaultValue={item.draft_url ?? ""}
                    onBlur={(event) =>
                      deliverableMutation.mutate({ id: item.id, draftUrl: event.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`final-${item.id}`}>Final link</Label>
                  <Input
                    id={`final-${item.id}`}
                    className="mt-2"
                    defaultValue={item.final_url ?? ""}
                    onBlur={(event) =>
                      deliverableMutation.mutate({ id: item.id, finalUrl: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor={`caption-${item.id}`}>Caption</Label>
                <Textarea
                  id={`caption-${item.id}`}
                  rows={2}
                  className="mt-2"
                  defaultValue={item.caption ?? ""}
                  onBlur={(event) =>
                    deliverableMutation.mutate({ id: item.id, caption: event.target.value })
                  }
                />
              </div>
              {(item.reviews ?? []).length > 0 ? (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">What she said</p>
                  <ul className="mt-2 space-y-2">
                    {item.reviews.map((review: any) => (
                      <li key={review.id} className="text-base">
                        <span className="font-medium">
                          {review.decision === "approved" ? "Approved" : "Changes asked for"}
                        </span>
                        {review.comment ? ` — ${review.comment}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
