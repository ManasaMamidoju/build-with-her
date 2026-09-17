import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { formatWhen, podcastBookableBySlug } from "@/lib/booking-options";
import { computeSlots, type Slot } from "@/lib/slot-engine.server";
import { SITE } from "@/lib/site";

const podcastSlug = z.enum(["podcast-street", "podcast-longform"]);

/** Public, no sign-in: anyone can see and take an open podcast guest slot. */
export const getPodcastAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: podcastSlug }).parse(data))
  .handler(async ({ data }): Promise<Slot[]> => {
    const service = podcastBookableBySlug(data.slug);
    if (!service) throw new Error("We do not have that podcast slot.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [rulesRes, bookingsRes] = await Promise.all([
      supabaseAdmin
        .from("availability_rules")
        .select("weekday, start_minute, end_minute, slot_minutes, buffer_minutes, min_notice_hours")
        .eq("active", true),
      supabaseAdmin
        .from("bookings")
        .select("starts_at, ends_at")
        .neq("status", "cancelled")
        .gte("starts_at", new Date().toISOString()),
    ]);

    return computeSlots(rulesRes.data ?? [], bookingsRes.data ?? [], service.durationMinutes);
  });

const bookSchema = z.object({
  slug: podcastSlug,
  startsAt: z.string().datetime(),
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: z.string().trim().email("That email does not look right").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  instagram: z.string().trim().max(160).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
});

export const createPodcastBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookSchema.parse(data))
  .handler(async ({ data }) => {
    const service = podcastBookableBySlug(data.slug);
    if (!service) throw new Error("We do not have that podcast slot.");

    const start = new Date(data.startsAt);
    if (start.getTime() < Date.now()) {
      throw new Error("That time has passed. Pick another one.");
    }
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    const email = data.email.toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { assertNotFlooding } = await import("@/lib/rate-limit.server");
    await assertNotFlooding({
      email,
      kind: "podcast_booking",
      maxInWindow: 3,
      message: "You already have a podcast slot held. We will be in touch.",
    });

    const { data: clash } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .neq("status", "cancelled")
      .lt("starts_at", end.toISOString())
      .gt("ends_at", start.toISOString())
      .limit(1);
    if (clash && clash.length > 0) {
      throw new Error("Someone just took that time. Pick another one.");
    }

    const { data: personId, error: personError } = await supabaseAdmin.rpc(
      "people_find_or_create",
      {
        _full_name: data.fullName,
        _email: email,
        ...(data.businessName ? { _business_name: data.businessName } : {}),
        ...(data.phone ? { _phone: data.phone } : {}),
        _source: data.source || "podcast_booking",
      },
    );
    if (personError || !personId) {
      console.error("podcast booking person link failed", personError?.message);
      throw new Error("We could not hold that slot. Please try again.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        person_id: personId,
        service_slug: data.slug,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        intake: {
          fullName: data.fullName,
          email,
          phone: data.phone || "",
          businessName: data.businessName || "",
          instagram: data.instagram || "",
        },
      })
      .select("id")
      .single();

    if (error || !row) {
      console.error("podcast booking failed", error?.message);
      throw new Error("We could not hold that slot. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email,
      person_id: personId,
      kind: "podcast_booking",
      source: data.source || null,
      detail: { service: data.slug, startsAt: start.toISOString() },
    });
    if (touchError) console.error("touchpoint write failed", touchError.message);

    const whenLabel = formatWhen(start.toISOString());
    try {
      const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
      await triggerN8nEmail({
        event: "booking_confirmation",
        idempotencyKey: `booking_confirmation:${row.id}`,
        recipient: { email, fullName: data.fullName },
        data: {
          serviceName: service.name,
          whenLabel,
          durationMinutes: service.durationMinutes,
          locationNote: "We will send filming details before your slot.",
        },
      });
      await triggerN8nEmail({
        event: "booking_admin_notify",
        idempotencyKey: `booking_admin_notify:${row.id}`,
        recipient: { email: SITE.email, fullName: "Manasa" },
        data: {
          personName: data.fullName,
          personEmail: email,
          serviceName: service.name,
          whenLabel,
          adminUrl: `${SITE.url}/admin/podcast`,
        },
      });
    } catch (emailError) {
      console.error("podcast booking email failed", emailError);
    }

    try {
      const { upsertCalendarEvent } = await import("@/lib/google-calendar.server");
      const result = await upsertCalendarEvent({
        googleEventId: null,
        summary: `${service.name} — ${data.fullName}`,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        attendeeEmail: email,
      });
      if (result) {
        await supabaseAdmin
          .from("bookings")
          .update({ google_event_id: result.googleEventId, meet_link: result.meetLink })
          .eq("id", row.id);
      }
    } catch (calendarError) {
      console.error("podcast booking calendar sync failed", calendarError);
    }

    return { id: row.id as string };
  });
