import { createFileRoute, redirect } from "@tanstack/react-router";

/** Short link for social bios: sends guests through the standard member booking flow. */
export const Route = createFileRoute("/book/clarity")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/book/$slug", params: { slug: "clarity-call" } });
  },
});
