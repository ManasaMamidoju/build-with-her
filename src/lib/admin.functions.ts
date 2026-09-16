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

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });

export const getAdminToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();

    const [bookings, scores, waitlists, attendees] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("id, service_slug, starts_at, status, user_id, intake")
        .gte("starts_at", now.toISOString())
        .lte("starts_at", soon)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true }),
      supabaseAdmin
        .from("score_submissions")
        .select("id, full_name, email, business_name, total_score, band, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("waitlists")
        .select("id, service_slug, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("event_attendees")
        .select("id, full_name, business_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      bookings: bookings.data ?? [],
      scores: scores.data ?? [],
      waitlists: waitlists.data ?? [],
      attendees: attendees.data ?? [],
    };
  });

export const listPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        stage: z.string().trim().max(40).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, business_name, phone, lead_stage, primary_source, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.search) {
      const term = `%${data.search}%`;
      query = query.or(`full_name.ilike.${term},email.ilike.${term},business_name.ilike.${term}`);
    }
    if (data.stage) query = query.eq("lead_stage", data.stage);

    const { data: rows, error } = await query;
    if (error) {
      console.error("listPeople failed", error.message);
      return [];
    }
    return rows ?? [];
  });

export const getPerson = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, email, business_name, phone, lead_stage, primary_source, consent_email, consent_sms, consent_community, created_at",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (!profile) return null;

    const [handles, notes, bookings, scores, touchpoints] = await Promise.all([
      supabaseAdmin.from("person_handles").select("platform, handle").eq("profile_id", data.id),
      supabaseAdmin
        .from("person_notes")
        .select("id, body, created_at")
        .eq("profile_id", data.id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("bookings")
        .select("id, service_slug, starts_at, status")
        .eq("user_id", data.id)
        .order("starts_at", { ascending: false }),
      supabaseAdmin
        .from("score_submissions")
        .select("id, total_score, band, created_at, token")
        .or(`claimed_by.eq.${data.id},email.ilike.${profile.email ?? ""}`)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("touchpoints")
        .select("id, kind, source, detail, created_at")
        .eq("profile_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return {
      profile,
      handles: handles.data ?? [],
      notes: notes.data ?? [],
      bookings: bookings.data ?? [],
      scores: scores.data ?? [],
      touchpoints: touchpoints.data ?? [],
    };
  });

export const addPersonNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ profileId: z.string().uuid(), body: z.string().trim().min(1).max(4000) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("person_notes")
      .insert({ profile_id: data.profileId, author_id: context.userId, body: data.body });
    if (error) throw new Error("We could not save that note.");
    return { ok: true as const };
  });

export const setLeadStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        personId: z.string().uuid(),
        stage: z.enum(["new", "contacted", "call_booked", "proposal", "client", "past"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("people")
      .update({ lead_stage: data.stage })
      .eq("id", data.personId);
    if (error) throw new Error("We could not move her.");
    return { ok: true as const };
  });
