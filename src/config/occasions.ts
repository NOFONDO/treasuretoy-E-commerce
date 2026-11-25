import type { Occasion } from "@/types";

export const occasions: Record<Occasion, { title: string; blurb: string; description: string }> = {
  birthday: {
    title: "Birthday gifts",
    blurb: "Presents for young drivers and grown-up collectors.",
    description: "Birthday toy car gifts for children, teenagers and adult collectors.",
  },
  christmas: {
    title: "Christmas collection",
    blurb: "Gift sets, stocking fillers and limited editions.",
    description: "Christmas toy car gifts, stocking fillers and collectible gift sets.",
  },
  premium: {
    title: "Premium gifts",
    blurb: "Luxury miniatures and limited-edition releases.",
    description: "Premium gifts: luxury miniature automobiles and limited-edition collectible models.",
  },
};

export const isOccasion = (v: string): v is Occasion => v in occasions;
