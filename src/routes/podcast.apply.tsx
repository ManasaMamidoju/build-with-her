import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

const QUESTIONS: { id: string; label: string; helper?: string }[] = [
  {
    id: "story",
    label: "What did you build, and what did it cost you to build it?",
    helper: "The part you would tell a friend, not the polished version.",
  },
  {
    id: "who",
    label: "Who do you serve, and what do they come to you for?",
  },
  {
    id: "why_now",
    label: "Why is now the right moment for you to be seen?",
  },
  {
    id: "anything_else",
    label: "Anything we should know before we film?",
  },
];

function Apply() {
  const submit = useServerFn(applyForPodcast);
  const [format, setFormat] = useState<"street" | "long">("street");
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
          stage: fields["stage"] ?? "",
          answers,
        },
      }),
    onSuccess: () => setDone(true),
    onError: (error: Error) => toast.error(error.message || "That did not send. Please try again."),
  });

  if (done) {
    return (
      <main className="container-editorial max-w-2xl py-16">
        <p className="eyebrow text-primary">Application sent</p>
        <h1 className="mt-3 text-4xl">Thank you. We read every one.</h1>
        <p className="prose-editorial mt-4 text-lg text-muted-foreground">
          We reply within five working days, either with a booking link or with a kind no and the
          one thing we would fix first. While you wait, take the Findability Score so we can talk
          about real numbers on the call.
        </p>
        <Button asChild size="lg" className="mt-8 h-12 px-7 text-base">
          <Link to="/score/quiz">Take the quiz</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <p className="eyebrow text-primary">Be a guest</p>
      <h1 className="mt-3 text-4xl">Apply to be on the podcast</h1>
      <p className="prose-editorial mt-4 text-lg text-muted-foreground">
        A few short sections. We reply within five working days, and we film in Miami.
      </p>

      <form
        className="mt-10 space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <fieldset className="rounded-2xl border border-border p-6">
          <legend className="px-2 text-sm font-medium">Which format?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "street",
                  title: "Street-style, $150",
                  blurb: "One short conversation, one clip set.",
                },
                {
                  value: "long",
                  title: "Long-form, $2,000",
                  blurb: "Full episode, five to six clips, plus a street-style.",
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
        </fieldset>

        <div>
          <h2 className="text-lg font-medium">About you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Your name" required fields={fields} setFields={setFields} />
            <Field
              id="email"
              label="Email"
              type="email"
              required
              fields={fields}
              setFields={setFields}
            />
            <Field id="phone" label="Phone (optional)" fields={fields} setFields={setFields} />
            <Field id="city" label="City" fields={fields} setFields={setFields} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Your business</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="businessName" label="Business name" fields={fields} setFields={setFields} />
            <Field id="instagram" label="Instagram" fields={fields} setFields={setFields} />
            <Field id="website" label="Website" fields={fields} setFields={setFields} />
          </div>
          <div className="mt-4">
            <Label htmlFor="stage">Your stage (take the score first)</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Not sure yet?{" "}
              <Link to="/score/quiz" className="text-primary underline">
                Take the Findability Score
              </Link>{" "}
              and come back to fill this in.
            </p>
            <select
              id="stage"
              value={fields["stage"] ?? ""}
              onChange={(event) => setFields((prev) => ({ ...prev, stage: event.target.value }))}
              className="mt-2 h-12 w-full rounded-md border border-border bg-card px-3 text-sm sm:max-w-xs"
            >
              <option value="">I have not taken it yet</option>
              <option value="Seed">Seed</option>
              <option value="Sprout">Sprout</option>
              <option value="Bud">Bud</option>
              <option value="Bloom">Bloom</option>
              <option value="Garden">Garden</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Your story</h2>
          <div className="mt-4 space-y-6">
            {QUESTIONS.map((question) => (
              <div key={question.id}>
                <Label htmlFor={question.id}>{question.label}</Label>
                {question.helper ? (
                  <p className="mt-1 text-sm text-muted-foreground">{question.helper}</p>
                ) : null}
                <Textarea
                  id={question.id}
                  className="mt-2"
                  rows={3}
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-7 text-base"
            disabled={mutation.isPending}
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
  required,
  fields,
  setFields,
}: {
  id: string;
  label: string;
  type?: string;
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
        required={required}
        className="mt-2"
        value={fields[id] ?? ""}
        onChange={(event) => setFields((prev) => ({ ...prev, [id]: event.target.value }))}
      />
    </div>
  );
}
