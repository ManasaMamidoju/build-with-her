import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { listApplications, startPodcastProject, updateApplication } from "@/lib/podcast.functions";
import { APPLICATION_LABELS, APPLICATION_STAGES } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/admin/podcast")({
  head: () => ({
    meta: [
      { title: "Podcast pipeline | Build With Her Media studio" },
      { name: "description", content: "Guest applications from applied to published." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PodcastPipeline,
});

function PodcastPipeline() {
  const fetchApplications = useServerFn(listApplications);
  const update = useServerFn(updateApplication);
  const start = useServerFn(startPodcastProject);
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "podcast-applications"],
    queryFn: () => fetchApplications(),
  });

  const move = useMutation({
    mutationFn: (input: { id: string; status?: string; notes?: string }) =>
      update({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "podcast-applications"] });
    },
    onError: () => toast.error("That did not save. Try again."),
  });

  const startProject = useMutation({
    mutationFn: (id: string) => start({ data: { id } }),
    onSuccess: () => {
      toast.success("Project started");
      queryClient.invalidateQueries({ queryKey: ["admin", "podcast-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: () => toast.error("We could not start that project."),
  });

  const rows = data ?? [];

  return (
    <div>
      <h1 className="text-3xl">Podcast pipeline</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Every woman who applied to be a guest. Approve her, then start her project to create the
        filming steps and her deliverable in one go.
      </p>

      {isLoading ? <p className="mt-8 text-muted-foreground">Fetching applications.</p> : null}

      {!isLoading && rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-xl">No applications yet</h2>
          <p className="mt-2 text-base text-muted-foreground">
            The form is live at /podcast/apply. Share it in your broadcast channel and applications
            land here.
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {APPLICATION_STAGES.map((stage) => (
          <div key={stage} className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{APPLICATION_LABELS[stage]}</p>
            <p className="numeric mt-1 text-2xl">
              {rows.filter((row: { status: string }) => row.status === stage).length}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {rows.map((row: any) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-medium">{row.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {[row.business_name, row.city, row.email].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.format === "long" ? "Long-form" : "Street-style"} ·{" "}
                  {new Date(row.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                  })}
                  {row.source ? ` · from ${row.source}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={row.status}
                  onChange={(event) => move.mutate({ id: row.id, status: event.target.value })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {APPLICATION_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {APPLICATION_LABELS[stage]}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenId(openId === row.id ? null : row.id)}
                >
                  {openId === row.id ? "Close" : "Open"}
                </Button>
              </div>
            </div>

            {openId === row.id ? (
              <div className="mt-5 space-y-4 border-t border-border pt-5">
                <dl className="space-y-3">
                  {Object.entries(row.answers ?? {}).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-muted-foreground">{key.replace(/_/g, " ")}</dt>
                      <dd className="text-base">{String(value) || "No answer"}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-3 text-sm">
                  {row.instagram ? (
                    <a
                      className="underline"
                      href={`https://instagram.com/${String(row.instagram).replace(/^@|^https?:\/\/(www\.)?instagram\.com\//, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Instagram
                    </a>
                  ) : null}
                  {row.website ? (
                    <a className="underline" href={row.website} target="_blank" rel="noreferrer">
                      Her website
                    </a>
                  ) : null}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground" htmlFor={`notes-${row.id}`}>
                    Your notes
                  </label>
                  <Textarea
                    id={`notes-${row.id}`}
                    defaultValue={row.notes ?? ""}
                    rows={3}
                    className="mt-2"
                    onBlur={(event) => move.mutate({ id: row.id, notes: event.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" onClick={() => startProject.mutate(row.id)}>
                    Start her project
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/projects">See all projects</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
