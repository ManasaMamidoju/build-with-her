import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setLeadStage } from "@/lib/admin.functions";
import { STAGES, getPipeline, type StageKey } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline | Build With Her Media" },
      { name: "description", content: "Every woman by stage, from first hello to client." },
      { property: "og:title", content: "Pipeline | Build With Her Media" },
      { property: "og:description", content: "Every woman by stage, from first hello to client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const listFn = useServerFn(getPipeline);
  const moveFn = useServerFn(setLeadStage);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["studio-pipeline"],
    queryFn: () => listFn({}),
  });

  async function move(personId: string, stage: StageKey) {
    try {
      await moveFn({ data: { personId, stage } });
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not move her.");
    }
  }

  const people = data ?? [];

  return (
    <div>
      <h1 className="text-3xl">Pipeline</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Every woman sits in one column. Use the arrows on her card to move her forward or back.
      </p>

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading your people.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage, stageIndex) => {
            const column = people.filter((p) => (p.lead_stage ?? "new") === stage.key);
            return (
              <section key={stage.key} className="rounded-2xl border border-border bg-card p-4">
                <header className="flex items-baseline justify-between">
                  <h2 className="text-base font-medium">{stage.label}</h2>
                  <span className="numeric text-sm text-muted-foreground">{column.length}</span>
                </header>

                {column.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Nobody here yet. Cards land here when you move them.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {column.map((person) => (
                      <li key={person.id} className="rounded-xl border border-border bg-background p-3">
                        <Link
                          to="/admin/people/$id"
                          params={{ id: person.id }}
                          className="text-sm font-medium underline-offset-4 hover:underline"
                        >
                          {person.full_name ?? person.email ?? "No name yet"}
                        </Link>
                        {person.business_name ? (
                          <p className="mt-1 text-xs text-muted-foreground">{person.business_name}</p>
                        ) : null}
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={stageIndex === 0}
                            onClick={() => {
                              const previous = STAGES[stageIndex - 1];
                              if (previous) void move(person.id, previous.key);
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            size="sm"
                            disabled={stageIndex === STAGES.length - 1}
                            onClick={() => {
                              const next = STAGES[stageIndex + 1];
                              if (next) void move(person.id, next.key);
                            }}
                          >
                            Forward
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
