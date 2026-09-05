import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: z.string().trim().email("That email does not look right").max(255),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us what you need").max(4000),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  consentEmail: z.boolean().optional(),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("touchpoints").insert({
      email: data.email.toLowerCase(),
      kind: "contact_message",
      source: data.source || null,
      detail: {
        fullName: data.fullName,
        businessName: data.businessName || null,
        message: data.message,
        consentEmail: data.consentEmail ?? false,
      },
    });

    if (error) {
      console.error("contact message failed", error.message);
      throw new Error("We could not send that. Please try again.");
    }

    return { ok: true as const };
  });
