import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { DELIVERABLE_STAGES, projectTypeLabel } from "@/lib/project-templates";

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

const STAGE_LABELS: Record<string, string> = {
  todo: "Not started",
  doing: "In progress",
  done: "Done",
};

function ProjectDetail() {
  const { id } = Route.useParams();
  const fetchProject = useServerFn(getProjectForTeam);
  const stageStatus = useServerFn(setStageStatus);
  const persistProject = useServerFn(saveProject);
  const persistDeliverable = useServerFn(saveDeliverable);
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "project", id],
    queryFn: () => fetchProject({ data: { id } }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "project", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
  };

  const stageMutation = useMutation({
    mutationFn: (input: NonNullable<Parameters<typeof stageStatus>[0]>["data"]) =>
      stageStatus({ data: input }),
    onSuccess: invalidate,
    onError: () => toast.error("That did not save."),
  });

  const projectMutation = useMutation({
    mutationFn: (input: Omit<NonNullable<Parameters<typeof persistProject>[0]>["data"], "id">) =>
      persistProject({ data: { id, ...input } }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: () => toast.error("That did not save."),
  });

  const deliverableMutation = useMutation({
    mutationFn: (input: NonNullable<Parameters<typeof persistDeliverable>[0]>["data"]) =>
      persistDeliverable({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      setNewTitle("");
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

  const { project, editors } = data;

  return (
    <div>
      <Link to="/admin/projects" className="text-sm text-muted-foreground underline">
        Back to projects
      </Link>
      <h1 className="mt-3 text-3xl">{project.name}</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {projectTypeLabel(project.type)}
        {data.person?.full_name ? ` · ${data.person.full_name}` : " · no one linked yet"}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border p-5">
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
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <Label htmlFor="due">Due date</Label>
          <Input
            id="due"
            type="date"
            className="mt-2"
            defaultValue={project.due_at ? String(project.due_at).slice(0, 10) : ""}
            onBlur={(event) => projectMutation.mutate({ dueAt: event.target.value || null })}
          />
        </div>
        {data.person?.id ? (
          <Button asChild variant="outline">
            <Link to="/admin/people/$id" params={{ id: data.person.id }}>
              Open her page
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        <Label htmlFor="project-notes">Your notes</Label>
        <Textarea
          id="project-notes"
          rows={3}
          className="mt-2"
          defaultValue={project.notes ?? ""}
          onBlur={(event) => projectMutation.mutate({ notes: event.target.value })}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Steps</h2>
        <ol className="mt-4 space-y-2">
          {(data.stages ?? []).map((stage, index: number) => (
            <li
              key={stage.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="text-base">
                {index + 1}. {stage.name}
              </span>
              <select
                value={stage.status}
                onChange={(event) =>
                  stageMutation.mutate({
                    stageId: stage.id,
                    status: event.target.value as "todo" | "doing" | "done",
                  })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Deliverables</h2>
        <p className="mt-2 text-base text-muted-foreground">
          What she sees and approves. Move a piece to her review once the final link is in; that
          starts her five working day window.
        </p>

        <form
          className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (newTitle.trim()) {
              deliverableMutation.mutate({ projectId: id, title: newTitle, stage: "not_started" });
            }
          }}
        >
          <div className="min-w-[220px] flex-1">
            <Label htmlFor="new-deliverable">Add a deliverable</Label>
            <Input
              id="new-deliverable"
              className="mt-2"
              placeholder="Reel 1: her origin story"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </div>
          <Button type="submit">Add it</Button>
        </form>

        <div className="mt-4 space-y-3">
          {(data.deliverables ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-medium">{item.title}</p>
                <select
                  value={item.stage}
                  onChange={(event) =>
                    deliverableMutation.mutate({ id: item.id, stage: event.target.value })
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {DELIVERABLE_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <UrlField
                  id={`raw-${item.id}`}
                  label="Raw footage link"
                  value={item.raw_url}
                  onSave={(value) => deliverableMutation.mutate({ id: item.id, rawUrl: value })}
                />
                <UrlField
                  id={`edited-${item.id}`}
                  label="Edited link"
                  value={item.edited_url}
                  onSave={(value) => deliverableMutation.mutate({ id: item.id, editedUrl: value })}
                />
                <UrlField
                  id={`final-${item.id}`}
                  label="Final link"
                  value={item.final_url}
                  onSave={(value) => deliverableMutation.mutate({ id: item.id, finalUrl: value })}
                />
                <UrlField
                  id={`published-${item.id}`}
                  label="Posted link"
                  value={item.published_url}
                  onSave={(value) =>
                    deliverableMutation.mutate({ id: item.id, publishedUrl: value })
                  }
                />
                <div>
                  <Label htmlFor={`editor-${item.id}`}>Editor</Label>
                  <select
                    id={`editor-${item.id}`}
                    value={item.assigned_to ?? ""}
                    onChange={(event) =>
                      deliverableMutation.mutate({ id: item.id, assignedTo: event.target.value })
                    }
                    className="mt-2 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">No one yet</option>
                    {editors.map((editor) => (
                      <option key={editor.id} value={editor.id}>
                        {editor.full_name ?? editor.email ?? "Editor"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`editor-due-${item.id}`}>Editor due date</Label>
                  <Input
                    id={`editor-due-${item.id}`}
                    type="date"
                    className="mt-2"
                    defaultValue={item.editor_due_at ? String(item.editor_due_at).slice(0, 10) : ""}
                    onBlur={(event) =>
                      deliverableMutation.mutate({
                        id: item.id,
                        editorDueAt: event.target.value || null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label htmlFor={`notes-${item.id}`}>Notes she can read</Label>
                <Textarea
                  id={`notes-${item.id}`}
                  rows={2}
                  className="mt-2"
                  defaultValue={item.team_notes ?? ""}
                  onBlur={(event) =>
                    deliverableMutation.mutate({ id: item.id, teamNotes: event.target.value })
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={item.cm_approved}
                    onChange={(event) =>
                      deliverableMutation.mutate({
                        id: item.id,
                        cmApproved: event.target.checked,
                      })
                    }
                  />
                  Content manager signed off
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={item.admin_approved}
                    onChange={(event) =>
                      deliverableMutation.mutate({
                        id: item.id,
                        adminApproved: event.target.checked,
                      })
                    }
                  />
                  You signed off
                </label>
                <span>
                  Changes used: {item.revisions_used ?? 0} of {item.revisions_allowed ?? 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function UrlField({
  id,
  label,
  value,
  onSave,
}: {
  id: string;
  label: string;
  value: string | null;
  onSave: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="mt-2"
        defaultValue={value ?? ""}
        onBlur={(event) => onSave(event.target.value)}
      />
    </div>
  );
}
