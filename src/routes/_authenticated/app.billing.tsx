import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/billing")({
  head: () => ({
    meta: [
      { title: "Your payments | Build With Her Media" },
      { name: "description", content: "Every payment and invoice in one place." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Billing,
});

function Billing() {
  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl">Your payments</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Every payment you make to us, with the invoice you can hand to your bookkeeper.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-blush p-8">
        <h2 className="text-2xl">Nothing to show yet</h2>
        <p className="mt-3 text-base text-muted-foreground">
          You have not paid us for anything. When you do, the amount, the date and a receipt appear
          here, and you can download the invoice whenever you need it. Nothing here is a bill: we
          only charge for work you have agreed to.
        </p>
        <Button asChild className="mt-6">
          <Link to="/services">See what things cost</Link>
        </Button>
      </div>
    </main>
  );
}
