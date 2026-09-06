import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const waitlistSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(60),
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: z.string().trim().email("That email does not look right").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  note: z.string().trim().max(1200).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  consentEmail: z.boolean().optional(),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => waitlistSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { assertNotFlooding } = await import("@/lib/rate-limit.server");
    await assertNotFlooding({
      email,
      kind: "waitlist_join",
      maxInWindow: 3,
      message: "You are already on this list. We will be in touch.",
    });


    const { error } = await supabaseAdmin.from("waitlists").insert({
      service_slug: data.serviceSlug,
      full_name: data.fullName,
      email,
      phone: data.phone || null,
      business_name: data.businessName || null,
      note: data.note || null,
      source: data.source || null,
      consent_email: data.consentEmail ?? false,
    });

    if (error) {
      console.error("waitlist join failed", error.message);
      throw new Error("We could not add you to the list. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email,
      kind: "waitlist_join",
      source: data.source || null,
      detail: { service: data.serviceSlug },
    });
    if (touchError) console.error("touchpoint write failed", touchError.message);

    return { ok: true as const };
  });
