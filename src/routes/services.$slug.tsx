import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { RoseMark } from "@/components/brand/RoseMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { serviceBySlug, SERVICES, type Service } from "@/lib/services";
import { canonical } from "@/lib/site";
import { getCapturedSource } from "@/lib/source-capture";
import { joinWaitlist } from "@/lib/waitlist.functions";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = serviceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Unavailable | Build With Her Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { service } = loaderData;
    const title = `${service.name} | Build With Her Media`;
    return {
      meta: [
        { title },
        { name: "description", content: service.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: service.summary.slice(0, 155) },
      ],
      links: [{ rel: "canonical", href: canonical(`/services/${params.slug}`) }],
    };
  },
  component: ServiceDetail,
  notFoundComponent: NotFoundService,
});

function NotFoundService() {
  return (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">We do not have that one</h1>
      <p className="mt-3 text-base text-muted-foreground">
        The link may be old. Here is everything we currently offer.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
        <Link to="/services">See the ways to work with us</Link>
      </Button>
    </main>
  );
}

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <main className="container-editorial py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">{service.step}</p>
      </div>

      <h1 className="mt-6 max-w-3xl">{service.name}</h1>
      <p className="numeric mt-4 text-2xl text-primary">
        {service.price}
        {service.priceNote ? (
          <span className="ml-3 align-middle text-base text-muted-foreground">
            {service.priceNote}
          </span>
        ) : null}
      </p>
      <p className="prose-editorial mt-5 text-lg text-muted-foreground">{service.summary}</p>
      <p className="mt-3 text-base text-muted-foreground">{service.duration}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-7 shadow-card md:col-span-2">
          <h2 className="text-xl">What you get</h2>
          <ul className="mt-5 space-y-3">
            {service.includes.map((item) => (
              <li key={item} className="flex gap-3 text-base">
                <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-secondary p-7">
          <h2 className="text-xl">Best for</h2>
          <p className="mt-4 text-base text-muted-foreground">{service.bestFor}</p>
          <h3 className="mt-7 text-lg">Before we start</h3>
          <ul className="mt-3 space-y-2 text-base text-muted-foreground">
            {service.requires.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {service.waitlist ? (
        <WaitlistForm service={service} />
      ) : (
        <section className="mt-12 rounded-2xl border border-border bg-blush p-8 shadow-card">
          <h2 className="text-2xl">{service.ctaLabel}</h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">{service.ctaNote}</p>
          <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </section>
      )}

      {service.faqs.length ? (
        <section className="mt-16">
          <h2 className="text-2xl">Questions about {service.name.toLowerCase()}</h2>
          <dl className="mt-7 space-y-6">
            {service.faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <dt className="text-lg">{faq.q}</dt>
                <dd className="mt-2 text-base text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
          <FaqJsonLd items={service.faqs} />
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="text-2xl">Other ways to work with us</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {others.map((other) => (
            <Link
              key={other.slug}
              to="/services/$slug"
              params={{ slug: other.slug }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary"
            >
              <p className="eyebrow text-muted-foreground">{other.step}</p>
              <p className="mt-2 text-lg">{other.name}</p>
              <p className="numeric mt-1 text-base text-primary">{other.price}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function WaitlistForm({ service }: { service: Service }) {
  const join = useServerFn(joinWaitlist);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    note: "",
    consentEmail: true,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await join({
        data: {
          serviceSlug: service.slug,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          note: form.note,
          consentEmail: form.consentEmail,
          source: getCapturedSource()?.src ?? "direct",
        },
      });
      setDone(true);
    } catch (error) {
      console.error(error);
      toast.error("We could not add you to the list. Please check your email address and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <section className="mt-12 rounded-2xl border border-border bg-blush p-8 shadow-card">
        <h2 className="text-2xl">You are on the list</h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          We email you before the dates go anywhere else. While you wait, take the score so your
          first session starts with real answers.
        </p>
        <Button asChild size="lg" className="mt-7 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-12 rounded-2xl border border-border bg-blush p-8 shadow-card">
      <h2 className="text-2xl">{service.ctaLabel}</h2>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">{service.ctaNote}</p>

      <form className="mt-7 grid max-w-2xl gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="wl-name">Your name</Label>
            <Input
              id="wl-name"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="wl-email">Email</Label>
            <Input
              id="wl-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="wl-business">Business name</Label>
            <Input
              id="wl-business"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="wl-phone">Phone, if you want a text about dates</Label>
            <Input
              id="wl-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-2 h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="wl-note">What you most want to walk out able to do</Label>
          <Textarea
            id="wl-note"
            rows={3}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="mt-2"
          />
        </div>

        <label className="flex items-start gap-3 text-base">
          <Checkbox
            checked={form.consentEmail}
            onCheckedChange={(v) => setForm((f) => ({ ...f, consentEmail: v === true }))}
            className="mt-1"
          />
          <span className="text-muted-foreground">
            Email me the dates and the occasional useful thing. One click unsubscribes.
          </span>
        </label>

        <div>
          <Button type="submit" size="lg" className="h-12 px-7 text-base" disabled={saving}>
            {saving ? "Adding you" : "Join the waitlist"}
          </Button>
        </div>
      </form>
    </section>
  );
}
