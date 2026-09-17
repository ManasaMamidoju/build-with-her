import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendContactMessage } from "@/lib/contact.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { SITE, canonical } from "@/lib/site";

const TOPICS = [
  { value: "working-together", label: "Working together" },
  { value: "podcast", label: "The podcast" },
  { value: "event", label: "An event" },
  { value: "other", label: "Something else" },
] as const;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Talk to us | Build With Her Media" },
      {
        name: "description",
        content:
          "Send us a message about a build, a podcast episode, an event or the community. A person reads every one.",
      },
      { property: "og:title", content: "Talk to us" },
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
  const [topic, setTopic] = useState<string>(TOPICS[0].value);
  const [message, setMessage] = useState("");
  const [consentEmail, setConsentEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      const topicLabel = TOPICS.find((t) => t.value === topic)?.label ?? "Something else";
      await sendFn({
        data: {
          fullName,
          email,
          message: `Topic: ${topicLabel}\n\n${message}`,
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
    <main className="container-editorial max-w-5xl py-12 md:py-16">
      <p className="eyebrow text-primary">Contact</p>
      <h1 className="mt-3 text-4xl">Talk to us</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {sent ? (
          <div className="rounded-2xl border border-border bg-blush p-8">
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
          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label htmlFor="fullName">Name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 h-12"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="topic">What is this about?</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger id="topic" className="mt-2 h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
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
              {sending ? "Sending" : "Send"}
            </Button>

            <p className="pt-4 text-sm text-muted-foreground">
              {SITE.email}. We reply within two business days.
            </p>
          </form>
        )}

        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <h2 className="text-xl">Book a one-on-one</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Thirty minutes with Manasa. Take the score first so the call is about your business, not
            the basics.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 px-7 text-base">
            <Link to="/services/$slug" params={{ slug: "clarity-call" }}>
              Book a one-on-one
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
