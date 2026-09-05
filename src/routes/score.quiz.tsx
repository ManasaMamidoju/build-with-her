import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RoseMark } from "@/components/brand/RoseMark";
import { AREA_ORDER, AREAS, QUESTIONS, type AreaKey } from "@/lib/score-rubric";
import { submitScore } from "@/lib/score.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { canonical } from "@/lib/site";

const STORAGE_KEY = "bwhm.score.answers";

export const Route = createFileRoute("/score/quiz")({
  head: () => ({
    meta: [
      { title: "Get your Findability Score | Build With Her Media" },
      {
        name: "description",
        content:
          "Answer questions about your business in about three minutes and get your Findability Score out of 100, plus the three fixes to do first.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Get your Findability Score" },
      {
        property: "og:description",
        content: "Three minutes, five areas, one number, three fixes.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/score/quiz") }],
  }),
  component: QuizPage,
});

type HandleKey =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "other";

const HANDLE_FIELDS: { key: HandleKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "@yourbusiness" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourbusiness" },
  { key: "tiktok", label: "TikTok", placeholder: "@yourbusiness" },
  { key: "youtube", label: "YouTube", placeholder: "@yourchannel" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" },
  { key: "pinterest", label: "Pinterest", placeholder: "@yourbusiness" },
  { key: "other", label: "Anywhere else", placeholder: "Etsy, WhatsApp, Yelp, a directory" },
];

type Details = {
  fullName: string;
  email: string;
  businessName: string;
  website: string;
  phone: string;
  handles: Record<HandleKey, string>;
  consentTerms: boolean;
  consentEmail: boolean;
  consentSms: boolean;
  consentCommunity: boolean;
};

const emptyDetails: Details = {
  fullName: "",
  email: "",
  businessName: "",
  website: "",
  phone: "",
  handles: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
    pinterest: "",
    other: "",
  },
  consentTerms: false,
  consentEmail: true,
  consentSms: false,
  consentCommunity: true,
};

function QuizPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitScore);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [saving, setSaving] = useState(false);

  const totalSteps = AREA_ORDER.length + 1;
  const isDetailsStep = step === AREA_ORDER.length;

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw) as Record<string, string>);
    } catch {
      // nothing saved, start fresh
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // storage unavailable, answers just live in memory
    }
  }, [answers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const areaKey = AREA_ORDER[Math.min(step, AREA_ORDER.length - 1)] as AreaKey;
  const area = AREAS[areaKey];
  const areaQuestions = QUESTIONS.filter((q) => q.area === areaKey);
  const answeredInArea = areaQuestions.filter((q) => answers[q.id]).length;
  const areaComplete = answeredInArea === areaQuestions.length;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const captured = getCapturedSource();
      const { token } = await submit({
        data: { answers, details: { ...details, source: captured?.src ?? "direct" } },
      });
      window.sessionStorage.removeItem(STORAGE_KEY);
      navigate({ to: "/score/r/$token", params: { token } });
    } catch (error) {
      console.error(error);
      toast.error("We could not save your score. Please check your email address and try again.");
      setSaving(false);
    }
  }

  return (
    <main className="container-editorial max-w-3xl py-12 md:py-16">
      <div className="flex items-center gap-3">
        <RoseMark className="h-7 w-7 text-primary" />
        <p className="eyebrow text-primary">Findability Score</p>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm text-muted-foreground">
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span>{isDetailsStep ? "Where to send it" : area.short}</span>
        </div>
        <Progress value={((step + 1) / totalSteps) * 100} className="mt-3 h-2" />
      </div>

      {isDetailsStep ? (
        <form onSubmit={handleSubmit} className="mt-10">
          <h1 className="text-3xl">Where should your score go?</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Your result appears on the next screen straight away. We keep it at a private link so you
            can come back to it any time.
          </p>

          <div className="mt-8 grid gap-5">
            <div>
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                required
                maxLength={120}
                value={details.fullName}
                onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                className="mt-2 h-12"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={255}
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                className="mt-2 h-12"
                autoComplete="email"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                This is where your score and your fixes go.
              </p>
            </div>
            <div>
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                maxLength={160}
                value={details.businessName}
                onChange={(e) => setDetails({ ...details, businessName: e.target.value })}
                className="mt-2 h-12"
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="website">Website or social handle</Label>
              <Input
                id="website"
                maxLength={255}
                placeholder="yourbusiness.com or @yourbusiness"
                value={details.website}
                onChange={(e) => setDetails({ ...details, website: e.target.value })}
                className="mt-2 h-12"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone, if you want a call instead</Label>
              <Input
                id="phone"
                maxLength={40}
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                className="mt-2 h-12"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" className="h-12 px-7 text-base" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working out your score
                </>
              ) : (
                "Show me my score"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-10">
          <h1 className="text-3xl">{area.title}</h1>
          <p className="mt-3 text-base text-muted-foreground">{area.blurb}</p>

          <div className="mt-8 space-y-8">
            {areaQuestions.map((question) => (
              <fieldset key={question.id}>
                <legend className="text-lg font-medium">{question.question}</legend>
                {question.helper ? (
                  <p className="mt-1 text-sm text-muted-foreground">{question.helper}</p>
                ) : null}
                <div className="mt-4 grid gap-2">
                  {question.choices.map((choice) => {
                    const selected = answers[question.id] === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: choice.value }))
                        }
                        aria-pressed={selected}
                        className={
                          selected
                            ? "rounded-xl border-2 border-primary bg-secondary px-4 py-3 text-left text-base"
                            : "rounded-xl border border-border bg-card px-4 py-3 text-left text-base transition-colors hover:border-primary"
                        }
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 px-7 text-base"
              onClick={() => setStep((s) => s + 1)}
              disabled={!areaComplete}
            >
              {step === AREA_ORDER.length - 1 ? "Last step" : "Next area"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : null}
            {!areaComplete ? (
              <p className="text-sm text-muted-foreground">
                {areaQuestions.length - answeredInArea} to go in this area
              </p>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
