import { createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { podcastBookableBySlug } from "@/lib/booking-options";
import { calendlyLinkFor } from "@/lib/calendly";
import { rememberPostLoginRedirect } from "@/lib/post-login-redirect";

/**
 * A short, shareable link straight into booking one specific thing — for a
 * bio link, an email, or a QR code. Podcast slugs skip straight to the
 * public calendar. Clarity Call and the Strategy Consult run on Calendly:
 * the Clarity Call is open to anyone, the Strategy Consult still asks her
 * to sign in first, so an account exists to attach it to.
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

    const calendlyUrl = calendlyLinkFor(params.slug);
    if (!calendlyUrl) {
      throw redirect({ to: "/services" });
    }

    if (params.slug === "strategy-consult") {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        rememberPostLoginRedirect(`/book/${params.slug}`);
        throw redirect({ to: "/login" });
      }
    }

    throw redirect({ href: calendlyUrl });
  },
});
