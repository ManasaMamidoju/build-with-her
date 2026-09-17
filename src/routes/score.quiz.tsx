import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoseMark } from "@/components/brand/RoseMark";
import { AREA_ORDER, AREAS, QUESTIONS, type AreaKey } from "@/lib/score-rubric";
import { submitScore } from "@/lib/score.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { rememberScoreToken } from "@/lib/score-memory";
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
  "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin" | "pinterest" | "other";

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [saving, setSaving] = useState(false);

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

  const answeredCount = useMemo(() => QUESTIONS.filter((q) => answers[q.id]).length, [answers]);
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

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
      rememberScoreToken(token);
      navigate({ to: "/score/r/$token", params: { token } });
    } catch (error) {
      console.error(error);
      toast.error("We could not save your score. Please check your email address and try again.");
      setSaving(false);
    }
  }

  return (
    <main>
      <div className="sticky top-16 z-30 h-14 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-editorial flex h-full items-center gap-4">
          <RoseMark className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="eyebrow shrink-0 text-primary">Findability Score</p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-rose transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {answeredCount} of {QUESTIONS.length} answered
          </span>
        </div>
      </div>

      <div className="container-editorial max-w-3xl py-10 md:py-14">
        {AREA_ORDER.map((areaKey: AreaKey) => {
          const area = AREAS[areaKey];
          const areaQuestions = QUESTIONS.filter((q) => q.area === areaKey);
          return (
            <section key={areaKey} className="mt-14 first:mt-0 scroll-mt-24" id={areaKey}>
              <h2>{area.title}</h2>
              <p className="mt-2 text-base text-muted-foreground">{area.blurb}</p>

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
                                ? "min-h-11 rounded-xl border-2 border-primary bg-secondary px-4 py-3 text-left text-base"
                                : "min-h-11 rounded-xl border border-border bg-card px-4 py-3 text-left text-base transition-colors hover:border-primary"
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
            </section>
          );
        })}

        <section className="mt-16 rounded-2xl border border-border bg-card p-7 shadow-card md:p-9">
          <h2>Before you see your score</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Enter a good email to get your score. Your result appears on the next screen straight
            away, at a private link you can come back to any time.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid gap-5">
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  maxLength={255}
                  placeholder="yourbusiness.com"
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
                <p className="mt-2 text-sm text-muted-foreground">
                  We text you back only about your call, and only if you leave a number.
                </p>
              </div>
            </div>

            <fieldset className="mt-10 rounded-2xl border border-border bg-secondary p-6">
              <legend className="px-2 text-lg font-medium">All of your handles</legend>
              <p className="text-sm text-muted-foreground">
                Every place you show up, even the quiet ones. We look at all of them before your
                call, so leave nothing out. Skip the ones you do not use.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {HANDLE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={`handle-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`handle-${field.key}`}
                      maxLength={160}
                      placeholder={field.placeholder}
                      value={details.handles[field.key]}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          handles: { ...details.handles, [field.key]: e.target.value },
                        })
                      }
                      className="mt-2 h-12"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 space-y-4">
              <label className="flex items-start gap-3 text-base">
                <Checkbox
                  checked={details.consentEmail}
                  onCheckedChange={(v) => setDetails({ ...details, consentEmail: v === true })}
                  className="mt-1"
                />
                <span>
                  Email me my score, my fixes, and what other women are doing that works. You can
                  stop any time in one click.
                </span>
              </label>
              <label className="flex items-start gap-3 text-base">
                <Checkbox
                  checked={details.consentSms}
                  onCheckedChange={(v) => setDetails({ ...details, consentSms: v === true })}
                  className="mt-1"
                />
                <span>
                  Text me about my clarity call time. Only if you left a phone number, and only
                  about your call.
                </span>
              </label>
              <label className="flex items-start gap-3 text-base">
                <Checkbox
                  checked={details.consentCommunity}
                  onCheckedChange={(v) => setDetails({ ...details, consentCommunity: v === true })}
                  className="mt-1"
                />
                <span>Invite me to the community of women building alongside me.</span>
              </label>
              <label className="flex items-start gap-3 text-base">
                <Checkbox
                  checked={details.consentTerms}
                  onCheckedChange={(v) => setDetails({ ...details, consentTerms: v === true })}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="underline">
                    terms
                  </Link>{" "}
                  and the{" "}
                  <Link to="/privacy" className="underline">
                    privacy notice
                  </Link>
                  . Required.
                </span>
              </label>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              We never sell your details and we never share your handles outside our team.
            </p>

            <div className="mt-9">
              <Button
                type="submit"
                size="lg"
                className="h-12 px-7 text-base"
                disabled={saving || !details.consentTerms}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working out your score
                  </>
                ) : (
                  "Get my score"
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
