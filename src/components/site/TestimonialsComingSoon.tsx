import { Quote } from "lucide-react";

/** No client testimonials to show yet, so we say that plainly instead of faking one. */
export function TestimonialsComingSoon() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <Quote className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-xl">Client stories are coming soon</h2>
      <p className="mt-3 text-base text-muted-foreground">
        We would rather wait for real results than write a testimonial for you. The first ones land
        here as soon as a client agrees to share hers.
      </p>
    </section>
  );
}
