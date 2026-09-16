import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { getMyProjects } from "@/lib/projects.functions";
import { projectTypeLabel } from "@/lib/project-templates";

export const Route = createFileRoute("/_authenticated/app/projects/")({
  head: () => ({
    meta: [
      { title: "My work | Build With Her Media" },
      { name: "description", content: "Where your work stands and what needs you next." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyProjects,
});

function MyProjects() {
  const fetchProjects = useServerFn(getMyProjects);
  const { data, isLoading } = useQuery({
    queryKey: ["my", "projects"],
    queryFn: () => fetchProjects(),
  });

  const rows = data ?? [];

  return (
    <div className="container-editorial py-12">
      <h1 className="text-4xl">Your work with us</h1>
      <p className="prose-editorial mt-3 text-lg text-muted-foreground">
        Every project we are running for you, the step it is on, and anything waiting on your
        approval.
      </p>

      {isLoading ? <p className="mt-8 text-muted-foreground">Fetching your work.</p> : null}

      {!isLoading && rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-2xl">Nothing here yet</h2>
          <p className="prose-editorial mt-2 text-base text-muted-foreground">
            Once we start filming or building for you, every step shows up here, and you approve
            each piece before it goes out.
          </p>
          <Button asChild className="mt-6">
            <Link to="/services">See what we do</Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {rows.map((row) => (
          <Link
            key={row.id}
            to="/app/projects/$id"
            params={{ id: row.id }}
            className="block rounded-2xl border border-border bg-card p-5 shadow-card hover:bg-secondary"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">{projectTypeLabel(row.type)}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                row.stage ? `On ${row.stage}` : null,
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
