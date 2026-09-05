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

export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("events")
    .select("slug, title, starts_at, ends_at, venue, city, description")
    .eq("published", true)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("list events failed", error.message);
    return [];
  }
  return data ?? [];
});

export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().trim().min(1).max(80) }).parse(data))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("events")
      .select("slug, title, starts_at, ends_at, venue, city, description")
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return row ?? null;
  });

const attendSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  businessName: z.string().trim().max(160),
  biggestGap: z.string().trim().max(600),
  consentEmail: z.boolean(),
  consentSms: z.boolean(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export const recordAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => attendSchema.parse(data))
  .handler(async ({ data, context }) => {
    const email = String(context.claims['email'] ?? "").toLowerCase();
    const { data: event } = await context.supabase
      .from("events")
      .select("id, slug, title")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!event) throw new Error("We cannot find that event.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, primary_source")
      .eq("id", context.userId)
      .maybeSingle();

    await supabaseAdmin
      .from("profiles")
      .update({
        business_name: data.businessName || null,
        phone: data.phone || null,
        consent_email: data.consentEmail,
        consent_sms: data.consentSms,
        primary_source: profile?.primary_source ?? `event:${event.slug}`,
      })
      .eq("id", context.userId);

    const { error } = await supabaseAdmin.from("event_attendees").upsert(
      {
        event_id: event.id,
        profile_id: context.userId,
        email: email || null,
        full_name: profile?.full_name ?? null,
        business_name: data.businessName || null,
        answers: { biggestGap: data.biggestGap },
        consent_email: data.consentEmail,
        consent_sms: data.consentSms,
      },
      { onConflict: "event_id,profile_id" },
    );

    if (error) {
      console.error("record attendance failed", error.message);
      throw new Error("We could not save that. Please try again.");
    }

    await supabaseAdmin.from("touchpoints").insert({
      profile_id: context.userId,
      email: email || null,
      kind: "event_signin",
      source: `event:${event.slug}`,
      detail: { event: event.title },
    });

    return { ok: true as const, title: event.title };
  });
