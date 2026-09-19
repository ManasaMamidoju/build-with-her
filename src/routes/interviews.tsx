import { createFileRoute, redirect } from "@tanstack/react-router";

/** The interview guest list now lives on the podcast page, alongside the episodes. */
export const Route = createFileRoute("/interviews")({
  beforeLoad: () => {
    throw redirect({ to: "/podcast" });
  },
});
