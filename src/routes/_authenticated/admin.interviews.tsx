import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getInterviewStats, listInterviews, saveInterview } from "@/lib/interviews.functions";

const STATUSES = [
  "",
  "Collected",
  "Interviewed",
  "Start Editing",
  "Editing",
  "Ready for Review",
  "Fix Issues",
  "Ready to Post",
  "Posted",
] as const;

export const Route = createFileRoute("/_authenticated/admin/interviews")({
  head: () => ({
    meta: [
      { title: "Interviews | Build With Her Media studio" },
      { name: "description", content: "Every interview, from filmed to posted." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InterviewsTracker,
});

function InterviewsTracker() {
  const fetchInterviews = useServerFn(listInterviews);
  const fetchStats = useServerFn(getInterviewStats);
  const save = useServerFn(saveInterview);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "interviews", search, status],
    queryFn: () => fetchInterviews({ data: { search, status } }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "interviews", "stats"],
    queryFn: () => fetchStats(),
  });

  const mutation = useMutation({
    mutationFn: (input: Record<string, unknown>) => save({ data: input as any }),
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "interviews"] });
    },
    onError: () => toast.error("That did not save. Try again."),
  });

  return (
    <div>
      <h1 className="text-3xl">Interviews</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Every woman you have filmed, with where her interview stands. Only the ones marked Posted
        with consent and approval show on the public page.
      </p>

      {stats ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Interviews on file" value={stats.total} />
          <Stat label="Consent confirmed" value={stats.consented} />
          <Stat label="Approved to post" value={stats.approved} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, business, event"
          className="h-11 max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((option) => (
            <button
              key={option || "all"}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                status === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {option || "Everyone"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          Nobody matches that. Clear the search to see everyone.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {data!.map((row: any) => (
            <li key={row.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg">{row.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[row.business_name, row.event_name, row.interview_date]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Tag>{row.overall_status || "No status"}</Tag>
                    {row.consent_confirmed ? <Tag>Consent yes</Tag> : <Tag>Consent missing</Tag>}
                    {row.approved_for_posting ? <Tag>Approved</Tag> : null}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setOpenId(openId === row.id ? null : row.id)}
                >
                  {openId === row.id ? "Close" : "Update"}
                </Button>
              </div>

              {openId === row.id ? (
                <form
                  className="mt-5 grid gap-4 border-t border-border pt-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    mutation.mutate({
                      id: row.id,
                      overall_status: String(form.get("overall_status") ?? ""),
                      editing_status: String(form.get("editing_status") ?? ""),
                      posting_status: String(form.get("posting_status") ?? ""),
                      consent_confirmed: form.get("consent_confirmed") === "on",
                      approved_for_posting: form.get("approved_for_posting") === "on",
                      video_approved: form.get("video_approved") === "on",
                      final_video_link: String(form.get("final_video_link") ?? ""),
                      notes: String(form.get("notes") ?? ""),
                    });
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Select
                      name="overall_status"
                      label="Where it stands"
                      defaultValue={row.overall_status ?? ""}
                      options={STATUSES.filter(Boolean) as unknown as string[]}
                    />
                    <Select
                      name="editing_status"
                      label="Editing"
                      defaultValue={row.editing_status ?? ""}
                      options={["Not Started", "In Progress", "Ready for Review", "Done"]}
                    />
                    <Select
                      name="posting_status"
                      label="Posting"
                      defaultValue={row.posting_status ?? ""}
                      options={["Not Scheduled", "Scheduled", "Posted"]}
                    />
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <Check name="consent_confirmed" label="She confirmed consent" defaultChecked={row.consent_confirmed} />
                    <Check name="approved_for_posting" label="Approved to post" defaultChecked={row.approved_for_posting} />
                    <Check name="video_approved" label="She approved the edit" defaultChecked={row.video_approved} />
                  </div>

                  <label className="grid gap-2 text-sm">
                    Final video link
                    <Input name="final_video_link" defaultValue={row.final_video_link ?? ""} className="h-11" />
                  </label>

                  <label className="grid gap-2 text-sm">
                    Notes
                    <textarea
                      name="notes"
                      defaultValue={row.notes ?? ""}
                      rows={3}
                      className="rounded-xl border border-input bg-background p-3 text-base"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving" : "Save this interview"}
                    </Button>
                    {row.instagram ? (
                      <Button variant="ghost" asChild>
                        <a href={row.instagram} target="_blank" rel="noreferrer">
                          Open her Instagram
                        </a>
                      </Button>
                    ) : null}
                    {row.video_link ? (
                      <Button variant="ghost" asChild>
                        <a href={row.video_link} target="_blank" rel="noreferrer">
                          Open the footage
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{children}</span>;
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-xl border border-input bg-background px-3 text-base"
      >
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}
