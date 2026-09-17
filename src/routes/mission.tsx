import { createFileRoute, redirect } from "@tanstack/react-router";

/** The mission line now lives on /about. Old links still land somewhere real. */
export const Route = createFileRoute("/mission")({
  loader: () => {
    throw redirect({ to: "/about" });
  },
});
