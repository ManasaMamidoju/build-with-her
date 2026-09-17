import { createFileRoute, redirect } from "@tanstack/react-router";

/** The article list now lives on /learn. Old links still land somewhere real. */
export const Route = createFileRoute("/blog/")({
  loader: () => {
    throw redirect({ to: "/learn" });
  },
});
