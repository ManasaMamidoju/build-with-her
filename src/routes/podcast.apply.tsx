import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const REVENUE_OPTIONS = [
  { value: "0-5k", label: "$0 - $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k-100k", label: "$50,000 - $100,000" },
  { value: "100k-plus", label: "$100k or more" },
] as const;

const REQUIRED_CHOICES: { id: string; label: string }[] = [
  { id: "decisionMaker", label: "Are you the primary decision maker" },
  { id: "socialMediaOptimized", label: "Is your social media optimized for monetization" },
  { id: "youtubeChannel", label: "Do you have a YouTube channel" },
  { id: "monthlyRevenue", label: "Your monthly revenue" },
  { id: "hasHighTicketOffer", label: "Do you have a high-ticket offer" },
  { id: "hasOffer", label: "Do you have an offer to present on the podcast" },
  { id: "tourFocus", label: "The main focus for this podcast tour" },
  { id: "wantsPodcastTour", label: "Interest in a wider podcast tour" },
  { id: "openToVipInvestment", label: "Openness to the VIP promotion package" },
  { id: "willPromote", label: "Whether you will promote your episode" },
  { id: "professionalToneOk", label: "Openness to thought-provoking topics" },
  { id: "wantsCommunity", label: "Joining the free community" },
];

const STORY_QUESTIONS: { id: string; label: string; helper?: string; required?: boolean }[] = [
  {
    id: "about_you",
    label: "Tell us a bit about yourself.",
    helper:
      "Your profession or title, current projects, and anything else you would like to share.",
    required: true,
  },
  {
    id: "topics",
    label: "What topics are you most passionate about discussing?",
    helper: "For example: wellness, personal development, career advice, self-improvement.",
    required: true,
  },
  {
    id: "why_podcast",
    label: "Why do you think a podcast will help your business?",
    required: true,
  },
  {
    id: "anything_else",
    label: "Anything else we should know before we film?",
  },
];

function Apply() {
  const submit = useServerFn(applyForPodcast);
  const [format, setFormat] = useState<"street" | "long">("street");
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const hasOffer = choices["hasOffer"] ?? "";

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          fullName: fields["fullName"] ?? "",
          email: fields["email"] ?? "",
          phone: fields["phone"] ?? "",
          businessName: fields["businessName"] ?? "",
          instagram: fields["instagram"] ?? "",
          socialTags: fields["socialTags"] ?? "",
          website: fields["website"] ?? "",
          city: fields["city"] ?? "",
          format,
          source: fields["source"] || (getCapturedSource()?.src ?? ""),
          stage: fields["stage"] ?? "",
          decisionMaker: choices["decisionMaker"] === "yes",
          socialMediaOptimized: (choices["socialMediaOptimized"] || "no") as
            "yes" | "no" | "more_info",
          youtubeChannel: (choices["youtubeChannel"] || "no") as "yes" | "no" | "not_yet",
          hasHighTicketOffer: choices["hasHighTicketOffer"] === "yes",
          hasOffer: (choices["hasOffer"] || "no") as "yes" | "no" | "unsure",
          monthlyRevenue: (choices["monthlyRevenue"] || "0-5k") as
            "0-5k" | "5k-10k" | "10k-25k" | "25k-50k" | "50k-100k" | "100k-plus",
          tourFocus: (choices["tourFocus"] || "both") as "authority" | "sales" | "both",
          wantsPodcastTour: (choices["wantsPodcastTour"] || "no") as "yes" | "no" | "more_info",
          openToVipInvestment: (choices["openToVipInvestment"] || "no") as
            "yes" | "no" | "more_info",
          willPromote: choices["willPromote"] === "yes",
          professionalToneOk: choices["professionalToneOk"] === "yes",
          wantsCommunity: choices["wantsCommunity"] === "yes",
          agreedToTerms: true,
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
        Fill this out truthfully and to the best of your ability. We reply within five working days,
        and we film in Miami.
      </p>

      <form
        className="mt-10 space-y-10"
        onSubmit={(event) => {
          event.preventDefault();
          const missing = REQUIRED_CHOICES.find((question) => !choices[question.id]);
          if (missing) {
            toast.error(`Please answer: ${missing.label}`);
            return;
          }
          if (!agreedToTerms) {
            toast.error("You need to agree to the terms before you can apply.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div>
          <h2 className="text-lg font-medium">About you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" required fields={fields} setFields={setFields} />
            <Field
              id="email"
              label="Email address"
              type="email"
              required
              fields={fields}
              setFields={setFields}
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              required
              fields={fields}
              setFields={setFields}
            />
            <Field
              id="city"
              label="Where do you live?"
              required
              fields={fields}
              setFields={setFields}
            />
            <div className="sm:col-span-2">
              <Field
                id="source"
                label="Who referred you, or where did you hear about us?"
                required
                fields={fields}
                setFields={setFields}
              />
            </div>
          </div>
          <div className="mt-4">
            <ChoiceField
              id="decisionMaker"
              label="Are you the primary decision maker for your business?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={choices["decisionMaker"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, decisionMaker: value }))}
            />
          </div>
        </div>

        <fieldset className="rounded-2xl border border-border p-6">
          <legend className="px-2 text-sm font-medium">
            What type of podcast interview are you most interested in?
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "street",
                  title: "Short interview episode, $150",
                  blurb: "One short conversation, one clip set.",
                },
                {
                  value: "long",
                  title: "Full studio podcast interview, $2,000",
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
          <p className="mt-3 text-sm text-muted-foreground">
            Not sure which fits? Tell us in "anything else" below and we will suggest one.
          </p>
        </fieldset>

        <div>
          <h2 className="text-lg font-medium">Your business</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="businessName" label="Business name" fields={fields} setFields={setFields} />
            <Field id="instagram" label="Instagram" fields={fields} setFields={setFields} />
            <Field id="website" label="Website" fields={fields} setFields={setFields} />
            <Field
              id="socialTags"
              label="Social media tags"
              helper="Label each platform, e.g. IG @yourhandle, TikTok @yourhandle, X @yourhandle."
              required
              fields={fields}
              setFields={setFields}
            />
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

          <div className="mt-6 space-y-5">
            <ChoiceField
              id="socialMediaOptimized"
              label="Is your social media optimized for monetization?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "more_info", label: "I would like more info" },
              ]}
              value={choices["socialMediaOptimized"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, socialMediaOptimized: value }))}
            />
            <ChoiceField
              id="youtubeChannel"
              label="Do you currently have a YouTube channel?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "not_yet", label: "Not yet" },
              ]}
              value={choices["youtubeChannel"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, youtubeChannel: value }))}
            />
            <div>
              <Label htmlFor="monthlyRevenue">What is the monthly revenue of your business?</Label>
              <Select
                value={choices["monthlyRevenue"] ?? ""}
                onValueChange={(value) =>
                  setChoices((prev) => ({ ...prev, monthlyRevenue: value }))
                }
              >
                <SelectTrigger id="monthlyRevenue" className="mt-2 sm:max-w-xs">
                  <SelectValue placeholder="Choose a range" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ChoiceField
              id="hasHighTicketOffer"
              label="Do you have a high-ticket offer?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={choices["hasHighTicketOffer"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, hasHighTicketOffer: value }))}
            />
            <ChoiceField
              id="hasOffer"
              label="Do you have an offer for your business to present on the podcast?"
              options={[
                { value: "yes", label: "Yes I do" },
                { value: "no", label: "No I don't" },
                { value: "unsure", label: "I don't know what that is" },
              ]}
              value={hasOffer}
              onChange={(value) => setChoices((prev) => ({ ...prev, hasOffer: value }))}
            />
            {hasOffer === "yes" ? (
              <div>
                <Label htmlFor="offer_description">
                  Give us a brief description of your offer.
                </Label>
                <Textarea
                  id="offer_description"
                  className="mt-2"
                  rows={3}
                  value={answers["offer_description"] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, offer_description: event.target.value }))
                  }
                />
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Your story</h2>
          <div className="mt-4 space-y-6">
            {STORY_QUESTIONS.map((question) => (
              <div key={question.id}>
                <Label htmlFor={question.id}>{question.label}</Label>
                {question.helper ? (
                  <p className="mt-1 text-sm text-muted-foreground">{question.helper}</p>
                ) : null}
                <Textarea
                  id={question.id}
                  className="mt-2"
                  rows={3}
                  required={question.required}
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
          <h2 className="text-lg font-medium">The podcast tour</h2>
          <div className="mt-4 space-y-5">
            <ChoiceField
              id="tourFocus"
              label="What is the main focus for this podcast tour?"
              options={[
                { value: "authority", label: "Authority focused" },
                { value: "sales", label: "Driving sales to your offer" },
                { value: "both", label: "Both" },
              ]}
              value={choices["tourFocus"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, tourFocus: value }))}
            />
            <ChoiceField
              id="wantsPodcastTour"
              label="Would you be interested in hopping on other podcasts as part of a wider tour?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "more_info", label: "I would like more information" },
              ]}
              value={choices["wantsPodcastTour"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, wantsPodcastTour: value }))}
            />
            <ChoiceField
              id="openToVipInvestment"
              label="Are you open to investing in our VIP promotion package?"
              helper="Includes custom clips from your episode, social media advertisements, and content promotion across platforms."
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "more_info", label: "I would like to learn more" },
              ]}
              value={choices["openToVipInvestment"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, openToVipInvestment: value }))}
            />
            <ChoiceField
              id="willPromote"
              label="Are you going to share and promote your episode with your audience when it's live?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={choices["willPromote"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, willPromote: value }))}
            />
            <ChoiceField
              id="professionalToneOk"
              label="Are you open to discussing thought-provoking topics while keeping a professional, respectful tone?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={choices["professionalToneOk"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, professionalToneOk: value }))}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Community and terms</h2>
          <div className="mt-4 space-y-5">
            <ChoiceField
              id="wantsCommunity"
              label="Would you like to be placed into our free community for event updates?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={choices["wantsCommunity"] ?? ""}
              onChange={(value) => setChoices((prev) => ({ ...prev, wantsCommunity: value }))}
            />
            <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
              <Checkbox
                id="agreedToTerms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="agreedToTerms" className="text-sm font-normal leading-relaxed">
                By submitting this form, I understand my appearance is subject to review and
                approval, and that there is an investment to work with Build With Her Media.
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-7 text-base"
            disabled={mutation.isPending || !agreedToTerms}
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
  helper,
  type = "text",
  required,
  fields,
  setFields,
}: {
  id: string;
  label: string;
  helper?: string;
  type?: string;
  required?: boolean;
  fields: Record<string, string>;
  setFields: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
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

function ChoiceField({
  id,
  label,
  helper,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
      <RadioGroup value={value} onValueChange={onChange} className="mt-2 flex flex-wrap gap-5">
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${id}-${option.value}`}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
