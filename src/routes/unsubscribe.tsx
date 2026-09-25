import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { unsubscribeByToken } from "@/lib/bingo.functions";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: z.object({ t: z.string().max(80).optional() }),
  head: () => ({
    meta: [
      { title: "Unsubscribe | Build With Her Media" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

/** A button, not an automatic unsubscribe on load, so email link scanners cannot trigger it. */
function UnsubscribePage() {
  const { t } = Route.useSearch();
  const unsubscribe = useServerFn(unsubscribeByToken);
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function confirm() {
    if (!t) return;
    setState("working");
    try {
      const res = await unsubscribe({ data: { token: t } });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      {state === "done" ? (
        <>
          <h1 className="text-3xl">You're unsubscribed</h1>
          <p className="mt-3 text-base text-muted-foreground">
            No more marketing emails from us. Your score link still works.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl">Unsubscribe from our emails?</h1>
          <p className="mt-3 text-base text-muted-foreground">
            You will stop getting marketing emails from {SITE.name}.
          </p>
          {t ? (
            <Button
              size="lg"
              className="mt-8 h-12 px-7 text-base"
              onClick={confirm}
              disabled={state === "working"}
            >
              {state === "working" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, unsubscribe me
            </Button>
          ) : null}
          {state === "error" || !t ? (
            <p className="mt-6 text-sm text-muted-foreground">
              That link did not work. Email {SITE.email} and we will take you off the list.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
