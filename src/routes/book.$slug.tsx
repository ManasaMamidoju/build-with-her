import { createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { bookableBySlug, podcastBookableBySlug } from "@/lib/booking-options";
import { rememberPostLoginRedirect } from "@/lib/post-login-redirect";

/**
 * A short, shareable link straight into booking one specific thing — for a
 * bio link, an email, or a QR code. Podcast slugs skip straight to the
 * public calendar; member services go through sign-in first if needed.
 */
export const Route = createFileRoute("/book/$slug")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const podcastService = podcastBookableBySlug(params.slug);
    if (podcastService) {
      throw redirect({
        to: "/podcast/book",
        search: { slug: podcastService.slug as "podcast-street" | "podcast-longform" },
      });
    }

    const service = bookableBySlug(params.slug);
    if (!service) {
      throw redirect({ to: "/services" });
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      rememberPostLoginRedirect(`/app/book/${service.slug}`);
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: "/app/book/$slug", params: { slug: service.slug } });
  },
});
