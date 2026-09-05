import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { listPeople } from "@/lib/admin.functions";

const STAGES = [
  { value: "", label: "Everyone" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "call_booked", label: "Call booked" },
  { value: "proposal", label: "Proposal" },
  { value: "client", label: "Client" },
  { value: "past", label: "Past" },
];

export const Route = createFileRoute("/_authenticated/admin/people/")({
  head: () => ({
    meta: [
      { title: "People | Build With Her Media studio" },
      { name: "description", content: "Everyone who has come through the door." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PeopleList,
});

function PeopleList() {
  const fetchPeople = useServerFn(listPeople);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "people", search, stage],
    queryFn: () => fetchPeople({ data: { search, stage } }),
  });

  return (
    <div>
      <h1 className="text-3xl">People</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Everyone with an account, newest first. Search by name, email or business.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="h-11 max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {STAGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStage(option.value)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                stage === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          Nobody matches that yet. Clear the search to see everyone.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {data!.map((person) => (
            <li key={person.id} className="p-5">
              <Link
                to="/admin/people/$id"
                params={{ id: person.id }}
                className="text-lg hover:text-primary"
              >
                {person.full_name ?? person.email ?? "No name yet"}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {[person.business_name, person.email, person.lead_stage]
                  .filter(Boolean)
                  .join(" \u00b7 ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
