import { createFileRoute, redirect } from "@tanstack/react-router";

/** The interview grid now lives on /podcast. Old links still land somewhere real. */
export const Route = createFileRoute("/interviews")({
  loader: () => {
    throw redirect({ to: "/podcast" });
  },
});
