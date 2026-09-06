import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Only interviews with consent, approval and a Posted status are readable here. */
export const listPublicInterviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("interviews")
    .select("slug, full_name, business_name, instagram, event_name, interview_date, final_video_link, posted_links")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("list public interviews failed", error.message);
    return [];
  }
  return data ?? [];
});

async function assertTeam(context: { supabase: any; userId: string }) {
  const roles = ["admin", "content_manager", "editor"] as const;
  for (const role of roles) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data === true) return;
  }
  throw new Error("Forbidden");
}

const listSchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  status: z.string().trim().max(40).optional().default(""),
});

export const listInterviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    await assertTeam(context);

    let query = context.supabase
      .from("interviews")
      .select("*")
      .order("created_at", { ascending: true });

    if (data.status) query = query.eq("overall_status", data.status);
    if (data.search) {
      const term = `%${data.search}%`;
      query = query.or(
        `full_name.ilike.${term},business_name.ilike.${term},event_name.ilike.${term},instagram.ilike.${term}`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const saveSchema = z.object({
  id: z.string().uuid(),
  overall_status: z.string().trim().max(40).nullable().optional(),
  editing_status: z.string().trim().max(40).nullable().optional(),
  posting_status: z.string().trim().max(40).nullable().optional(),
  consent_confirmed: z.boolean().optional(),
  approved_for_posting: z.boolean().optional(),
  video_approved: z.boolean().optional(),
  final_video_link: z.string().trim().max(600).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export const saveInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("interviews").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getInterviewStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertTeam(context);
    const { data, error } = await context.supabase
      .from("interviews")
      .select("overall_status, consent_confirmed, approved_for_posting");
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const byStatus = new Map<string, number>();
    for (const row of rows) {
      const key = row.overall_status ?? "No status";
      byStatus.set(key, (byStatus.get(key) ?? 0) + 1);
    }
    return {
      total: rows.length,
      consented: rows.filter((row: { consent_confirmed: boolean }) => row.consent_confirmed).length,
      approved: rows.filter((row: { approved_for_posting: boolean }) => row.approved_for_posting)
        .length,
      byStatus: [...byStatus.entries()].map(([label, count]) => ({ label, count })),
    };
  });
