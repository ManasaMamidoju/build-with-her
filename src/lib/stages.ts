import seedAsset from "@/assets/stages/stage-seed.png.asset.json";
import sproutAsset from "@/assets/stages/stage-sprout.png.asset.json";
import budAsset from "@/assets/stages/stage-bud.png.asset.json";
import bloomAsset from "@/assets/stages/stage-bloom.png.asset.json";
import gardenAsset from "@/assets/stages/stage-garden.png.asset.json";

export type Stage = {
  name: string;
  range: string;
  tagline: string;
  description: string;
  image: string;
  alt: string;
};

/** Ranges mirror the score bands in src/lib/score-rubric.ts. */
export const STAGES: Stage[] = [
  {
    name: "Seed",
    range: "0 to 39 out of 100",
    tagline: "Everything you need is there. Nobody can see it yet.",
    description:
      "Clients looking for exactly what you sell will not find you yet. There is no page, profile or listing doing the finding for you.",
    image: seedAsset.url,
    alt: "A single closed rose seed pod drawn in red, the Seed stage",
  },
  {
    name: "Sprout",
    range: "40 to 54 out of 100",
    tagline: "You have broken ground. Now you need a shape.",
    description:
      "You exist online, but almost nothing is working to bring you clients. What you have is scattered and says different things in different places.",
    image: sproutAsset.url,
    alt: "Two young rose leaves breaking out of a stem in red, the Sprout stage",
  },
  {
    name: "Bud",
    range: "55 to 69 out of 100",
    tagline: "Almost open. Most clients leave before it does.",
    description:
      "People do find you. Most of them fall out before they book, because the next step is unclear, slow or missing.",
    image: budAsset.url,
    alt: "A closed red rosebud on a curved stem, the Bud stage",
  },
  {
    name: "Bloom",
    range: "70 to 84 out of 100",
    tagline: "You are in full view. Now make it last.",
    description:
      "The basics hold. Clients find you, understand you and book you. What is missing is the part that compounds: follow up, reviews and repeat work.",
    image: bloomAsset.url,
    alt: "A fully open red rose seen from above, the Bloom stage",
  },
  {
    name: "Garden",
    range: "85 to 100 out of 100",
    tagline: "Your work keeps coming back to you.",
    description:
      "Your work keeps returning to you without you chasing it. From here it is about scale and story, not repair.",
    image: gardenAsset.url,
    alt: "Three red roses and buds growing together on one vine, the Garden stage",
  },
];
