export const SITE = {
  name: "Build With Her Media",
  legalName: "BUILD WITH HER MEDIA LLC",
  url: "https://buildwithhermedia.com",
  email: "hello@buildwithhermedia.com",
  city: "Miami",
  tagline: "Media, systems and AI for women who build.",
  description:
    "Find out how findable your business is in 3 minutes, then get the exact build that fixes it. Media, systems and AI for women who own businesses.",
} as const;

export const SOCIAL = {
  instagram: "https://instagram.com/buildwithher",
  youtube: "https://youtube.com/@buildwithher",
  linkedin: "https://linkedin.com/company/build-with-her-media",
  tiktok: "https://tiktok.com/@buildwithher",
} as const;

export const DIGIMAIDS_URL = "https://digimaids.com";

export function canonical(path: string) {
  return `${SITE.url}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
}
