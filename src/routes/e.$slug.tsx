import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RoseMark } from "@/components/brand/RoseMark";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { getPublicEvent, recordAttendance } from "@/lib/events.functions";
import { formatDay } from "@/lib/booking-options";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/e/$slug")({
  loader: async ({ params }) => {
    const event = await getPublicEvent({ data: { slug: params.slug } });
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Event"} sign in | Build With Her Media` },
      {
        name: "description",
        content: "Sign in at the event and get your Findability Score read with you.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: loaderData ? [{ rel: "canonical", href: canonical(`/e/${loaderData.slug}`) }] : [],
  }),
  component: EventSignIn,
  errorComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">This page did not load</h1>
      <Button asChild className="mt-8">
        <Link to="/events">See the events</Link>
      </Button>
    </main>
  ),
  notFoundComponent: () => (
    <main className="container-editorial max-w-2xl py-20 text-center">
      <h1 className="text-3xl">We cannot find that event</h1>
      <Button asChild className="mt-8">
        <Link to="/events">See the events</Link>
      </Button>
    </main>
  ),
});

function EventSignIn() {
  const event = Route.useLoaderData();
  const attendFn = useServerFn(recordAttendance);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [biggestGap, setBiggestGap] = useState("");
  const [consentEmail, setConsentEmail] = useState(true);
  const [consentSms, setConsentSms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in did not work.");
    }
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSaving(true);
    try {
      await attendFn({
        data: { slug: event.slug, businessName, phone, biggestGap, consentEmail, consentSms },
      });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-editorial max-w-xl py-12">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">{formatDay(event.starts_at)}</p>
      </div>
      <h1 className="mt-4 text-3xl">{event.title}</h1>
      <p className="mt-1 text-base text-muted-foreground">
        {[event.venue, event.city].filter(Boolean).join(", ")}
      </p>

      {done ? (
        <div className="mt-10 rounded-2xl bg-blush p-8">
          <h2 className="text-2xl">You are signed in</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Lovely to meet you. Take the Findability Score right here on your phone and we will read
            it with you at the table.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </div>
      ) : signedIn === false ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl">Sign in with Google first</h2>
          <p className="mt-3 text-base text-muted-foreground">
            One tap, no password to remember, and your score is waiting for you afterwards.
          </p>
          <Button size="lg" className="mt-6 h-12 px-7 text-base" onClick={signInWithGoogle}>
            Continue with Google
          </Button>
        </div>
      ) : signedIn === true ? (
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <Label htmlFor="businessName">Your business</Label>
            <Input
              id="businessName"
              required
              value={businessName}
              onChange={(changeEvent) => setBusinessName(changeEvent.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="phone">Your mobile number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(changeEvent) => setPhone(changeEvent.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="biggestGap">What is costing you the most right now?</Label>
            <Textarea
              id="biggestGap"
              value={biggestGap}
              onChange={(changeEvent) => setBiggestGap(changeEvent.target.value)}
              className="mt-2 min-h-24"
            />
          </div>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentEmail}
              onCheckedChange={(value) => setConsentEmail(value === true)}
              className="mt-1"
            />
            <span>Email me my score and new tutorials.</span>
          </label>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentSms}
              onCheckedChange={(value) => setConsentSms(value === true)}
              className="mt-1"
            />
            <span>Text me about sessions I book.</span>
          </label>
          <Button type="submit" size="lg" disabled={saving} className="h-12 px-7 text-base">
            {saving ? "Saving" : "Sign in at this event"}
          </Button>
        </form>
      ) : (
        <p className="mt-10 text-base text-muted-foreground">Loading</p>
      )}
    </main>
  );
}
