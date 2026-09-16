import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { listMergeCandidates, mergePeopleRecords } from "@/lib/people.functions";

const REASON: Record<string, string> = {
  same_name_different_email: "Same name, different or missing email",
  name_only_meets_reachable: "Someone we only knew by name now matches a woman we can reach",
};

export const Route = createFileRoute("/_authenticated/admin/duplicates")({
  head: () => ({
    meta: [
      { title: "Possible duplicates | Build With Her Media studio" },
      { name: "description", content: "Review and merge records that look like the same woman." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DuplicatesPage,
});

function DuplicatesPage() {
  const fetchCandidates = useServerFn(listMergeCandidates);
  const merge = useServerFn(mergePeopleRecords);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "duplicates"],
    queryFn: () => fetchCandidates(),
  });

  const mergeMutation = useMutation({
    mutationFn: (input: { keepId: string; mergeId: string }) => merge({ data: input }),
    onSuccess: () => {
      toast.success("Merged into one record");
      queryClient.invalidateQueries({ queryKey: ["admin", "duplicates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "people"] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "That did not merge. Try again."),
  });

  return (
    <div>
      <h1 className="text-3xl">Possible duplicates</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Nothing here is merged for you. Read both records, then choose which one to keep. Everything
        attached to the other record moves onto the one you keep.
      </p>

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          Nothing to review. Every record looks like its own person.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {data!
            .filter((row) => row.person_a_id && row.person_b_id)
            .map((row) => {
              const aId = row.person_a_id!;
              const bId = row.person_b_id!;
              return (
                <li key={`${aId}-${bId}`} className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">
                    {(row.reason ? REASON[row.reason] : null) ?? row.reason ?? "Possible duplicate"}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Side
                      name={row.person_a_name ?? "Unnamed"}
                      email={row.person_a_email}
                      identity={row.person_a_identity ?? "name_only"}
                      id={aId}
                      onKeep={() => mergeMutation.mutate({ keepId: aId, mergeId: bId })}
                      pending={mergeMutation.isPending}
                    />
                    <Side
                      name={row.person_b_name ?? "Unnamed"}
                      email={row.person_b_email}
                      identity={row.person_b_identity ?? "name_only"}
                      id={bId}
                      onKeep={() => mergeMutation.mutate({ keepId: bId, mergeId: aId })}
                      pending={mergeMutation.isPending}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

function Side({
  name,
  email,
  identity,
  id,
  onKeep,
  pending,
}: {
  name: string;
  email: string | null;
  identity: string;
  id: string;
  onKeep: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <Link to="/admin/people/$id" params={{ id }} className="text-lg hover:text-primary">
        {name}
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">{email ?? "No email on file"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{identity.replace("_", " ")}</p>
      <Button variant="secondary" className="mt-3" disabled={pending} onClick={onKeep}>
        Keep this one and merge the other in
      </Button>
    </div>
  );
}
