import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeSlots, type Slot } from "@/lib/slot-engine.server";

export type { Slot };

export const getAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ durationMinutes: z.number().int().min(15).max(240) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const [rulesRes, bookingsRes] = await Promise.all([
      context.supabase
        .from("availability_rules")
        .select("weekday, start_minute, end_minute, slot_minutes, buffer_minutes, min_notice_hours")
        .eq("active", true),
      context.supabase
        .from("bookings")
        .select("starts_at, ends_at")
        .neq("status", "cancelled")
        .gte("starts_at", new Date().toISOString()),
    ]);

    return computeSlots(rulesRes.data ?? [], bookingsRes.data ?? [], data.durationMinutes);
  });

const createSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(60),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240),
  intake: z.record(z.string(), z.string().max(2000)),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const start = new Date(data.startsAt);
    const end = new Date(start.getTime() + data.durationMinutes * 60000);

    if (start.getTime() < Date.now()) {
      throw new Error("That time has passed. Pick another one.");
    }

    const email = String(context.claims["email"] ?? "").toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (email) {
      await supabaseAdmin
        .from("score_submissions")
        .update({ claimed_by: context.userId })
        .is("claimed_by", null)
        .eq("email", email);
    }
    const { count: scoreCount } = await context.supabase
      .from("score_submissions")
      .select("id", { count: "exact", head: true })
      .eq("claimed_by", context.userId);
    if (!scoreCount) {
      throw new Error(
        "Take the Findability Score first, so we know what to focus this session on.",
      );
    }

    const { data: clash } = await context.supabase
      .from("bookings")
      .select("id")
      .neq("status", "cancelled")
      .lt("starts_at", end.toISOString())
      .gt("ends_at", start.toISOString())
      .limit(1);

    if (clash && clash.length > 0) {
      throw new Error("Someone just took that time. Pick another one.");
    }

    const { data: row, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        service_slug: data.serviceSlug,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        intake: data.intake,
      })
      .select("id")
      .single();

    if (error || !row) {
      console.error("create booking failed", error?.message);
      throw new Error("We could not save that booking. Please try again.");
    }

    await supabaseAdmin.from("touchpoints").insert({
      profile_id: context.userId,
      email: email || null,
      kind: "booking_created",
      detail: { service: data.serviceSlug, startsAt: start.toISOString() },
    });

    return { id: row.id as string };
  });

export const getMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("bookings")
      .select("id, service_slug, starts_at, ends_at, status, reschedule_count")
      .order("starts_at", { ascending: true });
    return data ?? [];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("bookings")
      .select("starts_at, status")
      .eq("id", data.id)
      .maybeSingle();

    if (!row) throw new Error("We cannot find that booking.");
    if (new Date(row.starts_at).getTime() - Date.now() < 24 * 3600000) {
      throw new Error("It is inside 24 hours. Email us and we will sort it out.");
    }

    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("We could not cancel that. Please try again.");
    return { ok: true as const };
  });

export const rescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        startsAt: z.string().datetime(),
        durationMinutes: z.number().int().min(15).max(240),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("bookings")
      .select("starts_at, reschedule_count")
      .eq("id", data.id)
      .maybeSingle();

    if (!row) throw new Error("We cannot find that booking.");
    if (row.reschedule_count >= 1) {
      throw new Error("This one has already been moved once. Email us for another change.");
    }
    if (new Date(row.starts_at).getTime() - Date.now() < 24 * 3600000) {
      throw new Error("It is inside 24 hours. Email us and we will sort it out.");
    }

    const start = new Date(data.startsAt);
    const end = new Date(start.getTime() + data.durationMinutes * 60000);
    const { error } = await context.supabase
      .from("bookings")
      .update({
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        reschedule_count: row.reschedule_count + 1,
      })
      .eq("id", data.id);

    if (error) throw new Error("We could not move that. Please try again.");
    return { ok: true as const };
  });
