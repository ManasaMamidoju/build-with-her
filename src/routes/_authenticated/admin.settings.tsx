import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAvailabilityRule,
  getStudioSettings,
  grantTeamRole,
  revokeTeamRole,
  saveAvailabilityRule,
  saveEmailTemplate,
  saveIndustry,
} from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Studio settings | Build With Her Media" },
      {
        name: "description",
        content: "Your hours, your email wording, your industries, your team.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StudioSettings,
});

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toClock(minute: number) {
  const h = String(Math.floor(minute / 60)).padStart(2, "0");
  const m = String(minute % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function fromClock(value: string) {
  const [h = "0", m = "0"] = value.split(":");
  return Number(h) * 60 + Number(m);
}

const TEMPLATE_NAMES: Record<string, string> = {
  booking_confirmed: "Her booking is confirmed",
  booking_reminder_24h: "Reminder, one day before",
  booking_cancelled: "Her booking was cancelled",
  score_result: "Her Findability Score result",
};

function StudioSettings() {
  const settingsFn = useServerFn(getStudioSettings);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["studio-settings"],
    queryFn: () => settingsFn({}),
  });

  if (isLoading || !data) {
    return <p className="text-base text-muted-foreground">Loading your settings.</p>;
  }

  return (
    <div className="space-y-14">
      <div>
        <h1 className="text-3xl">Studio settings</h1>
        <p className="mt-3 text-base text-muted-foreground">
          The hours women can book, the wording that goes out, your industry list and who else can
          get in.
        </p>
      </div>

      <Hours rules={data.rules} onChange={refetch} />
      <Templates templates={data.templates} onChange={refetch} />
      <Industries industries={data.industries} onChange={refetch} />
      <Team team={data.team} onChange={refetch} />
    </div>
  );
}

type Rule = {
  id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
  slot_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  active: boolean;
};

function Hours({ rules, onChange }: { rules: Rule[]; onChange: () => void }) {
  const saveFn = useServerFn(saveAvailabilityRule);
  const deleteFn = useServerFn(deleteAvailabilityRule);
  const [draft, setDraft] = useState({
    weekday: 1,
    start: "10:00",
    end: "17:00",
    slot: 30,
    buffer: 15,
    notice: 12,
  });

  async function add() {
    try {
      await saveFn({
        data: {
          id: null,
          weekday: draft.weekday,
          startMinute: fromClock(draft.start),
          endMinute: fromClock(draft.end),
          slotMinutes: draft.slot,
          bufferMinutes: draft.buffer,
          minNoticeHours: draft.notice,
          active: true,
        },
      });
      toast.success("Hours added");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save those hours.");
    }
  }

  async function toggle(rule: Rule) {
    try {
      await saveFn({
        data: {
          id: rule.id,
          weekday: rule.weekday,
          startMinute: rule.start_minute,
          endMinute: rule.end_minute,
          slotMinutes: rule.slot_minutes,
          bufferMinutes: rule.buffer_minutes,
          minNoticeHours: rule.min_notice_hours,
          active: !rule.active,
        },
      });
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not change that.");
    }
  }

  async function remove(id: string) {
    try {
      await deleteFn({ data: { id } });
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not remove those hours.");
    }
  }

  return (
    <section>
      <h2 className="text-2xl">When women can book you</h2>
      <p className="mt-2 text-base text-muted-foreground">
        Each line is one block of a day. Times are New York time. The gap is the breathing space
        after a session, and the notice is how far ahead she has to book.
      </p>

      {rules.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          No hours set, so nobody can book. Add your first block below.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <span className="w-28 text-sm font-medium">{WEEKDAYS[rule.weekday]}</span>
              <span className="numeric text-sm">
                {toClock(rule.start_minute)} to {toClock(rule.end_minute)}
              </span>
              <span className="text-sm text-muted-foreground">
                {rule.slot_minutes} min sessions, {rule.buffer_minutes} min gap,{" "}
                {rule.min_notice_hours} h notice
              </span>
              <span className="text-sm text-muted-foreground">
                {rule.active ? "Open" : "Paused"}
              </span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(rule)}>
                  {rule.active ? "Pause this block" : "Open this block"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(rule.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-blush p-6 md:grid-cols-3">
        <div>
          <Label htmlFor="weekday">Day</Label>
          <select
            id="weekday"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.weekday}
            onChange={(event) => setDraft({ ...draft, weekday: Number(event.target.value) })}
          >
            {WEEKDAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="start">Starts</Label>
          <Input
            id="start"
            type="time"
            className="mt-2"
            value={draft.start}
            onChange={(event) => setDraft({ ...draft, start: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end">Finishes</Label>
          <Input
            id="end"
            type="time"
            className="mt-2"
            value={draft.end}
            onChange={(event) => setDraft({ ...draft, end: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="slot">Session length in minutes</Label>
          <Input
            id="slot"
            type="number"
            className="mt-2"
            value={draft.slot}
            onChange={(event) => setDraft({ ...draft, slot: Number(event.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="buffer">Gap after in minutes</Label>
          <Input
            id="buffer"
            type="number"
            className="mt-2"
            value={draft.buffer}
            onChange={(event) => setDraft({ ...draft, buffer: Number(event.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="notice">Notice in hours</Label>
          <Input
            id="notice"
            type="number"
            className="mt-2"
            value={draft.notice}
            onChange={(event) => setDraft({ ...draft, notice: Number(event.target.value) })}
          />
        </div>
        <div className="md:col-span-3">
          <Button onClick={add}>Add these hours</Button>
        </div>
      </div>
    </section>
  );
}

type Template = { id: string; slug: string; subject: string; body: string; active: boolean };

function Templates({ templates, onChange }: { templates: Template[]; onChange: () => void }) {
  const saveFn = useServerFn(saveEmailTemplate);
  const [drafts, setDrafts] = useState<Record<string, { subject: string; body: string }>>({});

  async function save(template: Template) {
    const draft = drafts[template.id] ?? { subject: template.subject, body: template.body };
    try {
      await saveFn({
        data: {
          id: template.id,
          subject: draft.subject,
          body: draft.body,
          active: template.active,
        },
      });
      toast.success("Wording saved");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that wording.");
    }
  }

  return (
    <section>
      <h2 className="text-2xl">What your emails say</h2>
      <p className="mt-2 text-base text-muted-foreground">
        These go out the moment your sending account is connected. Anything inside double braces is
        filled in for you, like {"{{"}first_name{"}}"} and {"{{"}when{"}}"}.
      </p>

      <div className="mt-6 space-y-6">
        {templates.map((template) => {
          const draft = drafts[template.id] ?? { subject: template.subject, body: template.body };
          return (
            <div key={template.id} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg">{TEMPLATE_NAMES[template.slug] ?? template.slug}</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor={`subject-${template.id}`}>Subject line</Label>
                  <Input
                    id={`subject-${template.id}`}
                    className="mt-2"
                    value={draft.subject}
                    onChange={(event) =>
                      setDrafts({
                        ...drafts,
                        [template.id]: { ...draft, subject: event.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`body-${template.id}`}>The message</Label>
                  <Textarea
                    id={`body-${template.id}`}
                    rows={6}
                    className="mt-2"
                    value={draft.body}
                    onChange={(event) =>
                      setDrafts({
                        ...drafts,
                        [template.id]: { ...draft, body: event.target.value },
                      })
                    }
                  />
                </div>
                <Button onClick={() => save(template)}>Save this wording</Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type Industry = { id: string; slug: string; name: string; sort_order: number };

function Industries({ industries, onChange }: { industries: Industry[]; onChange: () => void }) {
  const saveFn = useServerFn(saveIndustry);
  const [name, setName] = useState("");

  async function add() {
    if (!name.trim()) return;
    try {
      await saveFn({ data: { id: null, name: name.trim(), sortOrder: industries.length + 1 } });
      setName("");
      toast.success("Industry added");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that industry.");
    }
  }

  return (
    <section>
      <h2 className="text-2xl">Your industry list</h2>
      <p className="mt-2 text-base text-muted-foreground">
        These are the choices a woman picks from in her own settings.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {industries.map((industry) => (
          <li
            key={industry.id}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            {industry.name}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm">
          <Label htmlFor="industry">Add an industry</Label>
          <Input
            id="industry"
            className="mt-2"
            value={name}
            placeholder="Interior design"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <Button onClick={add}>Add this industry</Button>
      </div>
    </section>
  );
}

type TeamMember = {
  id: string;
  role: string;
  userId: string;
  name: string | null;
  email: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Full access",
  content_manager: "Content manager",
  editor: "Editor",
  network_member: "Network member",
};

function Team({ team, onChange }: { team: TeamMember[]; onChange: () => void }) {
  const grantFn = useServerFn(grantTeamRole);
  const revokeFn = useServerFn(revokeTeamRole);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("content_manager");

  async function grant() {
    try {
      await grantFn({
        data: {
          email: email.trim(),
          role: role as "admin" | "content_manager" | "editor" | "network_member",
        },
      });
      setEmail("");
      toast.success("Access given");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not give her that access.");
    }
  }

  async function revoke(id: string) {
    try {
      await revokeFn({ data: { id } });
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not take that access away.");
    }
  }

  return (
    <section>
      <h2 className="text-2xl">Who else can get in</h2>
      <p className="mt-2 text-base text-muted-foreground">
        Add someone by the Google email she signs in with. She has to sign in once before you can
        give her access. Money pages stay yours alone.
      </p>

      {team.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          Only you have access right now.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {team.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <span className="text-sm font-medium">
                {member.name ?? member.email ?? "Someone"}
              </span>
              <span className="text-sm text-muted-foreground">{member.email}</span>
              <span className="text-sm text-muted-foreground">
                {ROLE_LABELS[member.role] ?? member.role}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => revoke(member.id)}
              >
                Remove access
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm">
          <Label htmlFor="team-email">Her Google email</Label>
          <Input
            id="team-email"
            type="email"
            className="mt-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="team-role">What she can do</Label>
          <select
            id="team-role"
            className="mt-2 h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="content_manager">Content manager</option>
            <option value="editor">Editor</option>
            <option value="network_member">Network member</option>
            <option value="admin">Full access</option>
          </select>
        </div>
        <Button onClick={grant}>Give her access</Button>
      </div>
    </section>
  );
}
