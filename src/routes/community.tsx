import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoseMark } from "@/components/brand/RoseMark";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { canonical, SOCIAL } from "@/lib/site";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Women building alongside you | Build With Her Media" },
      {
        name: "description",
        content:
          "Free, and the fastest way to get an answer from someone who has done it. The WhatsApp community, the Instagram broadcast and the Skool community.",
      },
      { property: "og:title", content: "Women building alongside you" },
      {
        property: "og:description",
        content: "Free, and the fastest way to get an answer from someone who has done it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/community") }],
  }),
  component: Community,
});

function Community() {
  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Community</p>
      </div>
      <h1 className="mt-4 text-4xl">Women building alongside you</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        Free, and the fastest way to get an answer from someone who has done it.
      </p>

      <div className="mt-10 grid gap-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl">WhatsApp community</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Questions, wins, and the tool links from every episode. Women only. Invitations go out
            by hand so the room stays useful.
          </p>
          <Button asChild size="lg" className="mt-5 h-11 px-6">
            <Link to="/contact">Ask for an invite</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl">Instagram broadcast</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Short updates when episodes and events drop.
          </p>
          <Button asChild size="lg" variant="outline" className="mt-5 h-11 px-6">
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer">
              Join the broadcast
            </a>
          </Button>
        </div>

        <SkoolCard />

        <div className="rounded-2xl border border-border bg-blush p-6 shadow-card">
          <h2 className="text-xl text-crimson-dark">Grow a stage together</h2>
          <p className="mt-2 text-base text-crimson-dark/90">
            Every member has a stage. Inside the community we track it, celebrate when it moves, and
            hold each other to the retake every 90 days.
          </p>
          <p className="mt-2 text-sm text-crimson-dark/80">
            Members who reach Bouquet get named on this page, with permission.
          </p>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Already with us? Turn the community invite on in{" "}
        <Link to="/app/settings" className="text-primary hover:underline">
          your details
        </Link>
        .
      </p>
    </main>
  );
}

function SkoolCard() {
  const join = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await join({
        data: {
          serviceSlug: "skool-community",
          fullName: email.split("@")[0] || "Skool waitlist",
          email,
          consentEmail: true,
          source: getCapturedSource()?.src ?? "direct",
        },
      });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not add you to the list.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl">The Skool community</h2>
        <span className="eyebrow rounded-full bg-secondary px-3 py-1 text-muted-foreground">
          In progress
        </span>
      </div>
      <p className="mt-2 text-base text-muted-foreground">
        A paid space with replays, templates and monthly calls. Opening when the first bootcamp
        does.
      </p>
      {done ? (
        <p className="mt-5 text-base text-crimson-dark">
          You are on the list. You hear before anyone else.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-wrap gap-3">
          <Input
            type="email"
            required
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 max-w-xs"
          />
          <Button type="submit" size="lg" disabled={saving} className="h-11 px-6">
            {saving ? "Joining" : "Join the waitlist"}
          </Button>
        </form>
      )}
    </div>
  );
}
