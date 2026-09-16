import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AuthedContext } from "@/lib/server-context";

async function assertAdmin(context: AuthedContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/* ---------------------------------- pipeline --------------------------------- */

export const STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "call_booked", label: "Call booked" },
  { key: "proposal", label: "Proposal sent" },
  { key: "client", label: "Client" },
  { key: "past", label: "Past" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const getPipeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("people")
      .select(
        "id, full_name, email, business_name, lead_stage, primary_source, identity_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

/* ---------------------------------- calendar --------------------------------- */

export const getStudioCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ fromIso: z.string().datetime(), toIso: z.string().datetime() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, person_id, service_slug, starts_at, ends_at, status")
      .gte("starts_at", data.fromIso)
      .lt("starts_at", data.toIso)
      .order("starts_at", { ascending: true });

    const ids = Array.from(
      new Set((bookings ?? []).map((b) => b.user_id).filter((id): id is string => id !== null)),
    );
    const { data: people } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

    const byId = new Map((people ?? []).map((p) => [p.id, p]));

    return (bookings ?? []).map((b) => ({
      ...b,
      personName: b.user_id
        ? (byId.get(b.user_id)?.full_name ?? byId.get(b.user_id)?.email ?? "Someone")
        : "Guest",
    }));
  });

/* ---------------------------------- settings --------------------------------- */

export const getStudioSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [rules, templates, industries, roles] = await Promise.all([
      supabaseAdmin
        .from("availability_rules")
        .select(
          "id, weekday, start_minute, end_minute, slot_minutes, buffer_minutes, min_notice_hours, active",
        )
        .order("weekday", { ascending: true }),
      supabaseAdmin
        .from("email_templates")
        .select("id, slug, subject, body, active")
        .order("slug", { ascending: true }),
      supabaseAdmin.from("industries").select("id, slug, name, sort_order").order("sort_order"),
      supabaseAdmin.from("user_roles").select("id, user_id, role"),
    ]);

    const ids = Array.from(new Set((roles.data ?? []).map((r) => r.user_id)));
    const { data: people } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
    const byId = new Map((people ?? []).map((p) => [p.id, p]));

    return {
      rules: rules.data ?? [],
      templates: templates.data ?? [],
      industries: industries.data ?? [],
      team: (roles.data ?? [])
        .filter((r) => r.role !== "client" && r.role !== "visitor")
        .map((r) => ({
          id: r.id,
          role: r.role as string,
          userId: r.user_id,
          name: byId.get(r.user_id)?.full_name ?? null,
          email: byId.get(r.user_id)?.email ?? null,
        })),
    };
  });

const ruleSchema = z.object({
  id: z.string().uuid().nullable(),
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  slotMinutes: z.number().int().min(15).max(240),
  bufferMinutes: z.number().int().min(0).max(120),
  minNoticeHours: z.number().int().min(0).max(168),
  active: z.boolean(),
});

export const saveAvailabilityRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ruleSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.endMinute <= data.startMinute) {
      throw new Error("The finish time has to be after the start time.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      weekday: data.weekday,
      start_minute: data.startMinute,
      end_minute: data.endMinute,
      slot_minutes: data.slotMinutes,
      buffer_minutes: data.bufferMinutes,
      min_notice_hours: data.minNoticeHours,
      active: data.active,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("availability_rules").update(row).eq("id", data.id)
      : await supabaseAdmin.from("availability_rules").insert(row);
    if (error) throw new Error("We could not save those hours. Please try again.");
    return { ok: true as const };
  });

export const deleteAvailabilityRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("availability_rules").delete().eq("id", data.id);
    if (error) throw new Error("We could not remove those hours.");
    return { ok: true as const };
  });

export const saveEmailTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(8000),
        active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("email_templates")
      .update({ subject: data.subject, body: data.body, active: data.active })
      .eq("id", data.id);
    if (error) throw new Error("We could not save that wording.");
    return { ok: true as const };
  });

export const saveIndustry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable(),
        name: z.string().trim().min(1).max(80),
        sortOrder: z.number().int().min(0).max(999),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { error } = data.id
      ? await supabaseAdmin
          .from("industries")
          .update({ name: data.name, sort_order: data.sortOrder })
          .eq("id", data.id)
      : await supabaseAdmin
          .from("industries")
          .insert({ name: data.name, slug, sort_order: data.sortOrder });
    if (error) throw new Error("We could not save that industry.");
    return { ok: true as const };
  });

const TEAM_ROLES = ["admin", "content_manager", "editor", "network_member"] as const;

export const grantTeamRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ email: z.string().trim().email(), role: z.enum(TEAM_ROLES) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();

    if (!profile) {
      throw new Error(
        "No account with that email yet. Ask her to sign in with Google once, then add her.",
      );
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: profile.id, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error("We could not give her that access.");
    return { ok: true as const };
  });

export const revokeTeamRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", data.id);
    if (error) throw new Error("We could not take that access away.");
    return { ok: true as const };
  });

/* ----------------------------------- events ---------------------------------- */

export const listStudioEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: events } = await supabaseAdmin
      .from("events")
      .select("id, slug, title, starts_at, ends_at, venue, city, description, published")
      .order("starts_at", { ascending: false });

    const { data: attendees } = await supabaseAdmin.from("event_attendees").select("event_id");
    const counts = new Map<string, number>();
    for (const row of attendees ?? []) {
      counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
    }

    return (events ?? []).map((e) => ({ ...e, attendeeCount: counts.get(e.id) ?? 0 }));
  });

const eventSchema = z.object({
  id: z.string().uuid().nullable(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lower case letters, numbers and dashes only."),
  title: z.string().trim().min(2).max(160),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable(),
  venue: z.string().trim().max(160),
  city: z.string().trim().max(80),
  description: z.string().trim().max(2000),
  published: z.boolean(),
});

export const saveStudioEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      slug: data.slug,
      title: data.title,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      venue: data.venue || null,
      city: data.city || null,
      description: data.description || null,
      published: data.published,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("events").update(row).eq("id", data.id)
      : await supabaseAdmin.from("events").insert(row);
    if (error) {
      console.error("save event failed", error.message);
      throw new Error("We could not save that event. Check the short name is not already used.");
    }
    return { ok: true as const };
  });

export const listEventAttendees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ eventId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("event_attendees")
      .select(
        "id, full_name, email, business_name, answers, consent_email, consent_sms, created_at",
      )
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: false });
    return rows ?? [];
  });

/* ----------------------------------- import ---------------------------------- */

const importRow = z.object({
  fullName: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
  businessName: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(60).optional().default(""),
  source: z.string().trim().max(80).optional().default(""),
});

export type ImportReport = {
  matched: { email: string; name: string }[];
  duplicates: { email: string; count: number }[];
  missingEmail: { name: string; businessName: string }[];
  newPeople: { email: string; name: string }[];
  applied: number;
};

export const importPeople = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ rows: z.array(importRow).max(2000), commit: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }): Promise<ImportReport> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const missingEmail: ImportReport["missingEmail"] = [];
    const seen = new Map<string, number>();
    const withEmail: { email: string; row: z.infer<typeof importRow> }[] = [];

    for (const row of data.rows) {
      const email = row.email.toLowerCase().trim();
      if (!email || !email.includes("@")) {
        missingEmail.push({ name: row.fullName, businessName: row.businessName });
        continue;
      }
      seen.set(email, (seen.get(email) ?? 0) + 1);
      if ((seen.get(email) ?? 0) === 1) withEmail.push({ email, row });
    }

    const duplicates = Array.from(seen.entries())
      .filter(([, count]) => count > 1)
      .map(([email, count]) => ({ email, count }));

    const { data: existing } = withEmail.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .in(
            "email",
            withEmail.map((r) => r.email),
          )
      : { data: [] as { id: string; email: string | null }[] };

    const existingByEmail = new Map(
      (existing ?? []).map((p) => [String(p.email ?? "").toLowerCase(), p.id]),
    );

    const matched: ImportReport["matched"] = [];
    const newPeople: ImportReport["newPeople"] = [];
    for (const item of withEmail) {
      if (existingByEmail.has(item.email)) {
        matched.push({ email: item.email, name: item.row.fullName });
      } else {
        newPeople.push({ email: item.email, name: item.row.fullName });
      }
    }

    let applied = 0;
    if (data.commit) {
      for (const item of withEmail) {
        const id = existingByEmail.get(item.email);
        if (id) {
          const patch: {
            full_name?: string;
            business_name?: string;
            phone?: string;
          } = {};
          if (item.row.fullName) patch["full_name"] = item.row.fullName;
          if (item.row.businessName) patch["business_name"] = item.row.businessName;
          if (item.row.phone) patch["phone"] = item.row.phone;
          if (Object.keys(patch).length === 0) continue;
          await supabaseAdmin.from("profiles").update(patch).eq("id", id);
          applied += 1;
          continue;
        }
        // No account yet: keep her as a touchpoint so she shows in the timeline
        // and can be matched the moment she signs in.
        await supabaseAdmin.from("touchpoints").insert({
          email: item.email,
          kind: "imported_contact",
          source: item.row.source || "notion_import",
          detail: {
            fullName: item.row.fullName,
            businessName: item.row.businessName,
            phone: item.row.phone,
          },
        });
        applied += 1;
      }
    }

    return { matched, duplicates, missingEmail, newPeople, applied };
  });
