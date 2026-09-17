import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyForPodcast } from "@/lib/podcast.functions";
import { getCapturedSource } from "@/lib/source-capture";

export const Route = createFileRoute("/podcast/apply")({
  head: () => ({
    meta: [
      { title: "Apply to be a guest | Build With Her Media" },
      {
        name: "description",
        content: "Tell us about your business and we will reply within five working days.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Apply,
});

const REVENUE_RANGES = ["$0 to 5k", "$5 to 10k", "$10 to 25k", "$25 to 50k", "$50k+"];

function Apply() {
  const submit = useServerFn(applyForPodcast);
  const [format, setFormat] = useState<"street" | "long">("street");
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revenue, setRevenue] = useState("");
  const [decisionMaker, setDecisionMaker] = useState<"yes" | "no" | "">("");
  const [consentCommunity, setConsentCommunity] = useState(true);
  const [consentEmail, setConsentEmail] = useState(true);
  const [reviewedAck, setReviewedAck] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          fullName: fields["fullName"] ?? "",
          email: fields["email"] ?? "",
          phone: fields["phone"] ?? "",
          businessName: fields["businessName"] ?? "",
          instagram: fields["instagram"] ?? "",
          website: fields["website"] ?? "",
          city: fields["city"] ?? "",
          format,
          source: getCapturedSource()?.src ?? "",
          answers: {
            ...answers,
            tiktok: fields["tiktok"] ?? "",
            linkedin: fields["linkedin"] ?? "",
            youtube: fields["youtube"] ?? "",
            x: fields["x"] ?? "",
            referred_by: fields["referredBy"] ?? "",
            monthly_revenue: revenue,
            decision_maker: decisionMaker,
            consent_community: consentCommunity ? "yes" : "no",
            consent_email: consentEmail ? "yes" : "no",
          },
        },
      }),
    onSuccess: () => setDone(true),
    onError: (error: Error) => toast.error(error.message || "That did not send. Please try again."),
  });

  if (done) {
    return (
      <main className="container-editorial max-w-2xl py-16">
        <p className="eyebrow text-primary">Application sent</p>
        <h1 className="mt-3 text-4xl">Got it.</h1>
        <p className="prose-editorial mt-4 text-lg text-muted-foreground">
          We review every application within five business days. You will hear from us by email
          either way.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/score/quiz">Take the Findability Score</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-12 px-7 text-base">
            <Link to="/podcast">Back to the podcast</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <p className="eyebrow text-primary">Be a guest</p>
      <h1 className="mt-3 text-4xl">Apply to be on the podcast</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        Tell us about yourself and your work. We reply within five working days, and we film in
        Miami.
      </p>

      <form
        className="mt-10 space-y-10"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <fieldset className="space-y-5">
          <legend className="text-lg font-medium">You</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" required fields={fields} setFields={setFields} />
            <Field
              id="email"
              label="Email"
              type="email"
              required
              fields={fields}
              setFields={setFields}
            />
            <Field id="businessName" label="Business name" fields={fields} setFields={setFields} />
            <Field id="city" label="Where you are based" fields={fields} setFields={setFields} />
            <Field id="phone" label="Phone (optional)" fields={fields} setFields={setFields} />
            <Field
              id="referredBy"
              label="Who told you about us? (optional)"
              fields={fields}
              setFields={setFields}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="text-lg font-medium">Where we can find you</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="instagram"
              label="Instagram"
              placeholder="@handle"
              fields={fields}
              setFields={setFields}
            />
            <Field
              id="tiktok"
              label="TikTok"
              placeholder="@handle"
              fields={fields}
              setFields={setFields}
            />
            <Field
              id="linkedin"
              label="LinkedIn"
              placeholder="@handle"
              fields={fields}
              setFields={setFields}
            />
            <Field
              id="youtube"
              label="YouTube"
              placeholder="@handle"
              fields={fields}
              setFields={setFields}
            />
            <Field id="x" label="X" placeholder="@handle" fields={fields} setFields={setFields} />
            <Field id="website" label="Website" fields={fields} setFields={setFields} />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-medium">Your work</legend>
          <Label htmlFor="about">
            Tell us about yourself: what you do, what you are building right now
          </Label>
          <p className="text-sm text-muted-foreground">Three to five sentences is perfect.</p>
          <Textarea
            id="about"
            rows={4}
            value={answers["about"] ?? ""}
            onChange={(event) => setAnswers((prev) => ({ ...prev, about: event.target.value }))}
          />
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="text-lg font-medium">The episode</legend>
          <div>
            <p className="text-sm font-medium">Format</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "street",
                    title: "Street style, $150",
                    blurb: "One short conversation, one clip set.",
                  },
                  {
                    value: "long",
                    title: "Long form, $2,000",
                    blurb: "Full episode, five to six clips, plus a street-style piece.",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  className={`rounded-xl border p-4 text-left ${
                    format === option.value
                      ? "border-primary bg-blush"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className="block font-medium">{option.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{option.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="topics">Topics you can talk about for an hour</Label>
            <Textarea
              id="topics"
              rows={3}
              className="mt-2"
              value={answers["topics"] ?? ""}
              onChange={(event) => setAnswers((prev) => ({ ...prev, topics: event.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="offer">Do you have an offer to present? If yes, tell us what.</Label>
            <Textarea
              id="offer"
              rows={2}
              className="mt-2"
              value={answers["offer"] ?? ""}
              onChange={(event) => setAnswers((prev) => ({ ...prev, offer: event.target.value }))}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="text-lg font-medium">Fit</legend>
          <div>
            <p className="text-sm font-medium">Monthly revenue range</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REVENUE_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setRevenue(range)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    revenue === range
                      ? "border-primary bg-blush text-crimson-dark"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Are you the decision maker for your business?</p>
            <div className="mt-2 flex gap-2">
              {(["yes", "no"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDecisionMaker(value)}
                  className={`rounded-full border px-5 py-2 text-sm capitalize ${
                    decisionMaker === value
                      ? "border-primary bg-blush text-crimson-dark"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="share">How will you share the episode with your audience?</Label>
            <Textarea
              id="share"
              rows={2}
              className="mt-2"
              value={answers["share_plan"] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, share_plan: event.target.value }))
              }
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Stay in touch</legend>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentCommunity}
              onCheckedChange={(v) => setConsentCommunity(v === true)}
              className="mt-1"
            />
            <span>Add me to the free WhatsApp community and IG broadcast for updates.</span>
          </label>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentEmail}
              onCheckedChange={(v) => setConsentEmail(v === true)}
              className="mt-1"
            />
            <span>Email me about my episode.</span>
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Before you send</legend>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={reviewedAck}
              onCheckedChange={(v) => setReviewedAck(v === true)}
              required
              className="mt-1"
            />
            <span>I understand appearances are reviewed, and paid before we film.</span>
          </label>
          <p className="text-sm text-muted-foreground">
            Have you taken your Findability Score?{" "}
            <Link to="/score/quiz" className="text-primary underline-offset-4 hover:underline">
              Take it in three minutes
            </Link>
          </p>
        </fieldset>

        <div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-7 text-base"
            disabled={mutation.isPending || !reviewedAck}
          >
            {mutation.isPending ? "Sending" : "Send my application"}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Payment happens after we approve you and before we film. Nothing is charged here.
          </p>
        </div>
      </form>
    </main>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required,
  fields,
  setFields,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  fields: Record<string, string>;
  setFields: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2"
        value={fields[id] ?? ""}
        onChange={(event) => setFields((prev) => ({ ...prev, [id]: event.target.value }))}
      />
    </div>
  );
}
