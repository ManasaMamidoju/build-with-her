import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

const IDENTITY = ["email", "handle", "name_only"] as const;

export const listPeopleRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        identity: z.enum(IDENTITY).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("people")
      .select(
        "id, full_name, email, business_name, phone, city, primary_source, identity_status, profile_id, consent_confirmed, created_at, person_handles(platform, handle), interviews(id, overall_status, event_name, interview_date, consent_confirmed, approved_for_posting)",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.identity) query = query.eq("identity_status", data.identity);
    if (data.search) {
      const term = `%${data.search}%`;
      query = query.or(
        `full_name.ilike.${term},email.ilike.${term},business_name.ilike.${term},city.ilike.${term}`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPersonRecord = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // The id may be a people id, or a profile id coming from an older link.
    let person: any = null;
    const byId = await supabaseAdmin.from("people").select("*").eq("id", data.id).maybeSingle();
    person = byId.data;
    if (!person) {
      const byProfile = await supabaseAdmin
        .from("people")
        .select("*")
        .eq("profile_id", data.id)
        .maybeSingle();
      person = byProfile.data;
    }
    if (!person) return null;

    const profileIds = person.profile_id ? [person.profile_id] : [];

    const [handles, notes, interviews, scores, touchpoints, waitlists, applications, bookings] =
      await Promise.all([
        supabaseAdmin.from("person_handles").select("*").eq("person_id", person.id),
        supabaseAdmin
          .from("person_notes")
          .select("*")
          .eq("person_id", person.id)
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("interviews").select("*").eq("person_id", person.id),
        supabaseAdmin
          .from("score_submissions")
          .select("id, total_score, band, created_at")
          .eq("person_id", person.id)
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("touchpoints")
          .select("id, kind, source, created_at")
          .eq("person_id", person.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabaseAdmin
          .from("waitlists")
          .select("id, service_slug, created_at")
          .eq("person_id", person.id),
        supabaseAdmin
          .from("podcast_applications")
          .select("id, format, status, created_at")
          .eq("person_id", person.id),
        profileIds.length
          ? supabaseAdmin
              .from("bookings")
              .select("id, service_slug, starts_at, status")
              .eq("user_id", profileIds[0])
              .order("starts_at", { ascending: false })
          : Promise.resolve({ data: [] as any[] }),
      ]);

    return {
      person,
      handles: handles.data ?? [],
      notes: notes.data ?? [],
      interviews: interviews.data ?? [],
      scores: scores.data ?? [],
      touchpoints: touchpoints.data ?? [],
      waitlists: waitlists.data ?? [],
      applications: applications.data ?? [],
      bookings: (bookings as any).data ?? [],
    };
  });

export const addPersonRecordNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ personId: z.string().uuid(), body: z.string().trim().min(1).max(4000) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: person } = await supabaseAdmin
      .from("people")
      .select("id, profile_id")
      .eq("id", data.personId)
      .maybeSingle();
    if (!person) throw new Error("We cannot find her");

    const { error } = await supabaseAdmin.from("person_notes").insert({
      person_id: person.id,
      profile_id: person.profile_id,
      author_id: context.userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMergeCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("people_merge_candidates")
      .select("*")
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const mergePeopleRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ keepId: z.string().uuid(), mergeId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("people_merge", {
      _keep_id: data.keepId,
      _merge_id: data.mergeId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
