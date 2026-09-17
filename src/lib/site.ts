export const SITE = {
  name: "Build With Her Media",
  legalName: "BUILD WITH HER MEDIA LLC",
  url: "https://buildwithhermedia.com",
  email: "hello@buildwithhermedia.com",
  tagline: "Get found. Get booked. Get paid.",
  description:
    "Find out how findable your business is in 3 minutes, then get the exact build that fixes it. Media, systems and AI for women who own businesses.",
} as const;

export function canonical(path: string) {
  return `${SITE.url}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
}
