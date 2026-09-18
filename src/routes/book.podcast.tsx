import { createFileRoute, redirect } from "@tanstack/react-router";

/** Short, say-it-out-loud link to the public podcast booking calendar. */
export const Route = createFileRoute("/book/podcast")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/podcast/book" });
  },
});
