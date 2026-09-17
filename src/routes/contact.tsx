import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { sendContactMessage } from "@/lib/contact.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { SITE, canonical } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Build With Her Media | Talk to a person" },
      {
        name: "description",
        content:
          "Send us a message about a build, a podcast episode, an event or the community. A person reads every one.",
      },
      { property: "og:title", content: "Talk to a person at Build With Her Media" },
      {
        property: "og:description",
        content: "Send a message about a build, an episode, an event or the community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
  }),
  component: Contact,
});

function Contact() {
  const sendFn = useServerFn(sendContactMessage);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [consentEmail, setConsentEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      await sendFn({
        data: {
          fullName,
          email,
          businessName,
          message,
          consentEmail,
          source: getCapturedSource()?.src ?? "direct",
        },
      });
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not send that.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <p className="eyebrow text-primary">Contact</p>
      <h1 className="mt-3 text-4xl">Tell us what you need</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        A person reads every message, usually the same day. If you would rather talk, take the
        Findability Score first and book a free clarity call.
      </p>

      {sent ? (
        <div className="mt-10 rounded-2xl border border-border bg-blush p-8">
          <h2 className="text-2xl">Message sent</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Thank you. We will come back to you at {email}. While you wait, the Findability Score
            tells us most of what we would ask on a first call.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
            <Link to="/score/quiz">Take the quiz</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="email">Your email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="businessName">Your business</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="message">What do you need?</Label>
            <Textarea
              id="message"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 min-h-32"
            />
          </div>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentEmail}
              onCheckedChange={(value) => setConsentEmail(value === true)}
              className="mt-1"
            />
            <span>You may email me about my message and about new tutorials.</span>
          </label>
          <Button type="submit" size="lg" disabled={sending} className="h-12 px-7 text-base">
            {sending ? "Sending" : "Send my message"}
          </Button>
        </form>
      )}

      <p className="mt-10 text-sm text-muted-foreground">You can also write to {SITE.email}.</p>
    </main>
  );
}
