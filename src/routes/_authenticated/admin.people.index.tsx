import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { listPeopleRecords } from "@/lib/people.functions";

const IDENTITIES = [
  { value: "", label: "Everyone" },
  { value: "email", label: "Has an email" },
  { value: "handle", label: "Has a handle" },
  { value: "name_only", label: "Only a name" },
] as const;

const IDENTITY_LABEL: Record<string, string> = {
  email: "Email on file",
  handle: "Handle on file",
  name_only: "Name only",
};

export const Route = createFileRoute("/_authenticated/admin/people/")({
  head: () => ({
    meta: [
      { title: "People | Build With Her Media studio" },
      { name: "description", content: "Everyone who has come through the door, in one place." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PeopleList,
});

function PeopleList() {
  const fetchPeople = useServerFn(listPeopleRecords);
  const [search, setSearch] = useState("");
  const [identity, setIdentity] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "people", search, identity],
    queryFn: () =>
      fetchPeople({ data: { search, identity: (identity || undefined) as any } }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">People</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Every woman who has touched the business, whether she filmed an interview, took the
            score, or signed in. One record each.
          </p>
        </div>
        <Link to="/admin/duplicates" className="text-sm text-primary hover:underline">
          Review possible duplicates
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, business, city"
          className="h-11 max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {IDENTITIES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setIdentity(option.value)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                identity === option.value
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
        <>
          <p className="mt-6 text-sm text-muted-foreground numeric">{data!.length} people</p>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {data!.map((person: any) => {
              const interview = person.interviews?.[0];
              const handle = person.person_handles?.[0];
              return (
                <li key={person.id} className="p-5">
                  <Link
                    to="/admin/people/$id"
                    params={{ id: person.id }}
                    className="text-lg hover:text-primary"
                  >
                    {person.full_name ?? person.email ?? "No name yet"}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[person.business_name, person.email, person.city, person.primary_source]
                      .filter(Boolean)
                      .join(" \u00b7 ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Tag>{IDENTITY_LABEL[person.identity_status] ?? person.identity_status}</Tag>
                    {person.profile_id ? <Tag>Signed in</Tag> : null}
                    {handle ? (
                      <Tag>
                        {handle.platform}: {handle.handle}
                      </Tag>
                    ) : null}
                    {interview ? <Tag>Interview: {interview.overall_status || "No status"}</Tag> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{children}</span>
  );
}
