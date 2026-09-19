import { createFileRoute, redirect } from "@tanstack/react-router";

import { podcastBookableBySlug } from "@/lib/booking-options";
import { calendlyLinkFor } from "@/lib/calendly";

/**
 * A short, shareable link straight into booking one specific thing — for a
 * bio link, an email, or a QR code. Podcast slugs skip straight to the
 * public calendar. Clarity Call and the Strategy Consult both run on
 * Calendly and are open to anyone, no account needed.
 */
export const Route = createFileRoute("/book/$slug")({
  ssr: false,
  beforeLoad: ({ params }) => {
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

    throw redirect({ href: calendlyUrl });
  },
});
