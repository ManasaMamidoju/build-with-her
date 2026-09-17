import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookableBySlug, formatWhen } from "@/lib/booking-options";
import { computeSlots, type Slot } from "@/lib/slot-engine.server";
import { SITE } from "@/lib/site";
import type { AuthedContext } from "@/lib/server-context";

export type { Slot };

async function getRecipient(context: AuthedContext) {
  const { data: profile } = await context.supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", context.userId)
    .maybeSingle();
  const email = profile?.email ?? "";
  return { email, fullName: profile?.full_name || email.split("@")[0] || "there" };
}

async function sendBookingConfirmation(
  context: AuthedContext,
  bookingId: string,
  serviceSlug: string,
  whenLabel: string,
) {
  try {
    const recipient = await getRecipient(context);
    if (!recipient.email) return;
    const service = bookableBySlug(serviceSlug);
    const serviceName = service?.name ?? serviceSlug;
    const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
    await triggerN8nEmail({
      event: "booking_confirmation",
      idempotencyKey: `booking_confirmation:${bookingId}`,
      recipient,
      data: {
        serviceName,
        whenLabel,
        durationMinutes: service?.durationMinutes ?? 0,
        locationNote: "We will send the video link before the session.",
      },
    });
    await triggerN8nEmail({
      event: "booking_admin_notify",
      idempotencyKey: `booking_admin_notify:${bookingId}`,
      recipient: { email: SITE.email, fullName: "Manasa" },
      data: {
        personName: recipient.fullName,
        personEmail: recipient.email,
        serviceName,
        whenLabel,
        adminUrl: `${SITE.url}/admin/calendar`,
      },
    });
  } catch (error) {
    console.error("booking confirmation email failed", error);
  }
}

async function sendBookingReschedule(
  context: AuthedContext,
  bookingId: string,
  serviceSlug: string,
  oldWhenLabel: string,
  newWhenLabel: string,
) {
  try {
    const recipient = await getRecipient(context);
    if (!recipient.email) return;
    const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
    await triggerN8nEmail({
      event: "booking_reschedule",
      idempotencyKey: `booking_reschedule:${bookingId}:${newWhenLabel}`,
      recipient,
      data: {
        serviceName: bookableBySlug(serviceSlug)?.name ?? serviceSlug,
        oldWhenLabel,
        newWhenLabel,
      },
    });
  } catch (error) {
    console.error("booking reschedule email failed", error);
  }
}

async function syncCalendarOnCreate(
  context: AuthedContext,
  bookingId: string,
  serviceSlug: string,
  startsAt: string,
  endsAt: string,
) {
  try {
    const recipient = await getRecipient(context);
    const service = bookableBySlug(serviceSlug);
    const { upsertCalendarEvent } = await import("@/lib/google-calendar.server");
    const result = await upsertCalendarEvent({
      googleEventId: null,
      summary: `${service?.name ?? serviceSlug} — ${recipient.fullName}`,
      startsAt,
      endsAt,
      ...(recipient.email ? { attendeeEmail: recipient.email } : {}),
    });
    if (result) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("bookings")
        .update({ google_event_id: result.googleEventId, meet_link: result.meetLink })
        .eq("id", bookingId);
    }
  } catch (error) {
    console.error("calendar sync (create) failed", error);
  }
}

async function syncCalendarOnReschedule(
  googleEventId: string | null,
  startsAt: string,
  endsAt: string,
) {
  if (!googleEventId) return;
  try {
    const { upsertCalendarEvent } = await import("@/lib/google-calendar.server");
    await upsertCalendarEvent({ googleEventId, startsAt, endsAt });
  } catch (error) {
    console.error("calendar sync (reschedule) failed", error);
  }
}

async function syncCalendarOnCancel(googleEventId: string | null) {
  if (!googleEventId) return;
  try {
    const { deleteCalendarEvent } = await import("@/lib/google-calendar.server");
    await deleteCalendarEvent(googleEventId);
  } catch (error) {
    console.error("calendar sync (cancel) failed", error);
  }
}

async function sendBookingCancelled(
  context: AuthedContext,
  bookingId: string,
  serviceSlug: string,
  whenLabel: string,
) {
  try {
    const recipient = await getRecipient(context);
    if (!recipient.email) return;
    const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
    await triggerN8nEmail({
      event: "booking_cancelled",
      idempotencyKey: `booking_cancelled:${bookingId}`,
      recipient,
      data: { serviceName: bookableBySlug(serviceSlug)?.name ?? serviceSlug, whenLabel },
    });
  } catch (error) {
    console.error("booking cancelled email failed", error);
  }
}

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

    await sendBookingConfirmation(
      context,
      row.id,
      data.serviceSlug,
      formatWhen(start.toISOString()),
    );
    await syncCalendarOnCreate(
      context,
      row.id,
      data.serviceSlug,
      start.toISOString(),
      end.toISOString(),
    );

    return { id: row.id as string };
  });

export const getMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("bookings")
      .select("id, service_slug, starts_at, ends_at, status, reschedule_count, meet_link")
      .order("starts_at", { ascending: true });
    return data ?? [];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("bookings")
      .select("starts_at, status, service_slug, google_event_id")
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

    await sendBookingCancelled(context, data.id, row.service_slug, formatWhen(row.starts_at));
    await syncCalendarOnCancel(row.google_event_id);

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
      .select("starts_at, reschedule_count, service_slug, google_event_id")
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

    await sendBookingReschedule(
      context,
      data.id,
      row.service_slug,
      formatWhen(row.starts_at),
      formatWhen(start.toISOString()),
    );
    await syncCalendarOnReschedule(row.google_event_id, start.toISOString(), end.toISOString());

    return { ok: true as const };
  });
