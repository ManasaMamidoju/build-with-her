import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { bookableBySlug, formatWhen, podcastBookableBySlug } from "@/lib/booking-options";

/**
 * Called on a schedule (Lovable Cloud cron, roughly every 15-30 minutes) to
 * send the day-before reminder for bookings starting in the next 23-25
 * hours that haven't been reminded yet. The window is wider than the cron
 * interval so a slow or delayed run never skips a booking.
 */
async function sendReminders(request: Request): Promise<Response> {
  const denied = await authenticateCronRequest(request);
  if (denied) return denied;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = Date.now();
  const windowStart = new Date(now + 23 * 3600000).toISOString();
  const windowEnd = new Date(now + 25 * 3600000).toISOString();

  const { data: rows, error } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, person_id, service_slug, starts_at")
    .neq("status", "cancelled")
    .is("reminder_sent_at", null)
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd);

  if (error) {
    console.error("send-booking-reminders query failed", error.message);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
  let sent = 0;

  for (const row of rows ?? []) {
    let recipient: { email: string; fullName: string } | null = null;

    if (row.user_id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", row.user_id)
        .maybeSingle();
      if (profile?.email) {
        recipient = { email: profile.email, fullName: profile.full_name || profile.email };
      }
    } else if (row.person_id) {
      const { data: person } = await supabaseAdmin
        .from("people")
        .select("full_name, email")
        .eq("id", row.person_id)
        .maybeSingle();
      if (person?.email) recipient = { email: person.email, fullName: person.full_name };
    }

    if (!recipient) continue;

    const serviceName =
      bookableBySlug(row.service_slug)?.name ??
      podcastBookableBySlug(row.service_slug)?.name ??
      row.service_slug;

    await triggerN8nEmail({
      event: "booking_reminder",
      idempotencyKey: `booking_reminder:${row.id}`,
      recipient,
      data: { serviceName, whenLabel: formatWhen(row.starts_at) },
    });

    await supabaseAdmin
      .from("bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id);
    sent += 1;
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/cron/send-booking-reminders")({
  server: {
    handlers: {
      GET: ({ request }) => sendReminders(request),
      POST: ({ request }) => sendReminders(request),
    },
  },
});
