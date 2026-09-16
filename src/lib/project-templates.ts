export const PROJECT_TYPES = [
  { value: "podcast", label: "Podcast" },
  { value: "build", label: "Automation build" },
  { value: "consult", label: "Strategy consult" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "event_media", label: "Event media" },
  { value: "custom", label: "Custom" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];

export const STAGE_TEMPLATES: Record<ProjectType, string[]> = {
  podcast: [
    "Paid",
    "Scheduled",
    "Recorded",
    "Editing",
    "Your review",
    "Approved",
    "Published",
    "Promoted",
  ],
  build: ["Kickoff", "Source and clarity", "Systems build", "Testing", "Handover", "Support"],
  consult: ["Booked", "Prep sent", "Call", "Roadmap delivered"],
  bootcamp: ["Enrolled", "Week 1 to 2", "Week 3 to 4", "Week 5 to 6", "Interview", "Complete"],
  event_media: ["Brief", "Shoot", "Editing", "Review", "Delivered"],
  custom: ["Kickoff", "In progress", "Review", "Delivered"],
};

export const DELIVERABLE_STAGES = [
  { value: "not_started", label: "Not started" },
  { value: "editing", label: "Editing" },
  { value: "team_review", label: "Team review" },
  { value: "client_review", label: "Her review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
] as const;

export const APPLICATION_STAGES = [
  "applied",
  "reviewed",
  "approved",
  "paid",
  "scheduled",
  "recorded",
  "published",
  "declined",
] as const;

export const APPLICATION_LABELS: Record<string, string> = {
  applied: "Applied",
  reviewed: "Reviewed",
  approved: "Approved",
  paid: "Paid",
  scheduled: "Scheduled",
  recorded: "Recorded",
  published: "Published",
  declined: "Not this time",
};

export function projectTypeLabel(type: string) {
  return PROJECT_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function deliverableStageLabel(stage: string) {
  return DELIVERABLE_STAGES.find((item) => item.value === stage)?.label ?? stage;
}
