import { createFileRoute } from "@tanstack/react-router";

import { verifyStripeWebhookSignature } from "@/lib/stripe.server";

/**
 * Stripe calls this after a Checkout Session finishes. We only trust it once
 * the signature checks out against STRIPE_WEBHOOK_SECRET; until that secret
 * and STRIPE_SECRET_KEY are both set, no session is ever created so this
 * never fires for real traffic.
 */
async function handleStripeWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature || !verifyStripeWebhookSignature(rawBody, signature)) {
    return new Response(JSON.stringify({ ok: false, error: "invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data: { object: { id: string; metadata?: { booking_id?: string } } };
  };

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const bookingId = event.data.object.metadata?.booking_id;
    if (bookingId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("bookings")
        .update({ stripe_payment_status: "paid" })
        .eq("id", bookingId)
        .eq("stripe_session_id", event.data.object.id);
    }
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const bookingId = event.data.object.metadata?.booking_id;
    if (bookingId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("bookings")
        .update({ stripe_payment_status: "failed" })
        .eq("id", bookingId)
        .eq("stripe_session_id", event.data.object.id);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/webhooks/stripe")({
  server: {
    handlers: {
      POST: ({ request }) => handleStripeWebhook(request),
    },
  },
});
