import type { Occasion, Product } from "@/types";

export type Recipient = "child" | "teenager" | "collector";

export interface Preference {
  id: string;
  label: string;
  /** Matches against the product category. */
  keywords: readonly string[];
}

export const preferences: readonly Preference[] = [
  { id: "rc", label: "Remote-control cars", keywords: ["remote"] },
  { id: "sports", label: "Sports cars", keywords: ["sports"] },
  { id: "super", label: "Supercars", keywords: ["super"] },
  { id: "collectible", label: "Collectible models", keywords: ["diecast", "classic", "limited", "display", "luxury"] },
  { id: "racing", label: "Racing cars", keywords: ["racing", "formula", "track"] },
  { id: "bundles", label: "Gift bundles", keywords: ["gift", "sets"] },
];

export interface GiftCriteria {
  occasion?: Occasion;
  recipient: Recipient;
  /** Recipient age in years. Required for child and teenager so suitability can be enforced. */
  age?: number;
  /** Inclusive budget range in GBP minor units. */
  budgetMinor?: { min: number; max: number };
  preferenceId?: string;
}

/**
 * Safety rules:
 *  - Collectibles are never returned for children (audience must be "children").
 *  - For children and teenagers the product's minimum age must be known and
 *    not above the recipient's age. Teenagers may also receive collectibles
 *    whose minimum age they meet.
 *  - Out-of-stock items are never recommended.
 */
export function findGifts(products: readonly Product[], c: GiftCriteria): Product[] {
  const preference = preferences.find((p) => p.id === c.preferenceId);

  return products
    .filter((p) => {
      if (p.stock <= 0) return false;

      if (c.recipient === "collector") {
        if (p.audience !== "collectors") return false;
      } else {
        if (c.age === undefined || p.ageMin === null || p.ageMin > c.age) return false;
        if (c.recipient === "child" && p.audience !== "children") return false;
      }

      if (c.occasion && !p.occasions.includes(c.occasion)) return false;
      if (c.budgetMinor && (p.priceMinor < c.budgetMinor.min || p.priceMinor > c.budgetMinor.max)) return false;
      if (preference) {
        const category = p.category.toLowerCase();
        if (!preference.keywords.some((k) => category.includes(k))) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.priceMinor - b.priceMinor);
}

export const budgetBands = [
  { label: "Under £25", min: 0, max: 2499 },
  { label: "£25 – £50", min: 2500, max: 5000 },
  { label: "£50 – £100", min: 5001, max: 10000 },
  { label: "£100 – £250", min: 10001, max: 25000 },
  { label: "£250 – £500", min: 25001, max: 50000 },
  { label: "Above £500", min: 50001, max: Number.MAX_SAFE_INTEGER },
] as const;
