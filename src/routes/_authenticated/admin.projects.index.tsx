import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, listProjects } from "@/lib/projects.functions";
import { PROJECT_TYPES, projectTypeLabel } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/admin/projects/")({
  head: () => ({
    meta: [
      { title: "Projects | Build With Her Media studio" },
      { name: "description", content: "Every piece of work, its stage and what is due." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Projects,
});

function Projects() {
  const fetchProjects = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const queryClient = useQueryClient();

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [newType, setNewType] = useState<string>("consult");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "projects", type, status],
    queryFn: () => fetchProjects({ data: { type, status } }),
  });

  const add = useMutation({
    mutationFn: () => create({ data: { name, type: newType as any } }),
    onSuccess: () => {
      toast.success("Project created with its steps");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: () => toast.error("We could not create that."),
  });

  const rows = data ?? [];

  return (
    <div>
      <h1 className="text-3xl">Projects</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Every job you are running, from a consult to a full build, with the step it is on. Each
        project gets its steps ready-made from the type you pick.
      </p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) add.mutate();
        }}
      >
        <div className="min-w-[220px] flex-1">
          <Label htmlFor="project-name">New project</Label>
          <Input
            id="project-name"
            className="mt-2"
            placeholder="Automation build: Rubin Design Co."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="project-type">Type</Label>
          <select
            id="project-type"
            value={newType}
            onChange={(event) => setNewType(event.target.value)}
            className="mt-2 block h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {PROJECT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={add.isPending}>
          Create project
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All types</option>
          {PROJECT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On hold</option>
          <option value="done">Done</option>
        </select>
      </div>

      {isLoading ? <p className="mt-8 text-muted-foreground">Fetching projects.</p> : null}

      {!isLoading && rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-xl">No projects yet</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Approve a podcast application, or create one above. The steps and her review view come
            with it.
          </p>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {rows.map((row: any) => (
          <Link
            key={row.id}
            to="/admin/projects/$id"
            params={{ id: row.id }}
            className="block rounded-2xl border border-border bg-card p-5 shadow-card hover:bg-secondary"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">{projectTypeLabel(row.type)}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                row.person?.full_name ?? "No one linked yet",
                row.stage ? `on ${row.stage}` : null,
                row.due_at
                  ? `due ${new Date(row.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
