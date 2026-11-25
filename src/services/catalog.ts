import type { Department, Occasion, Product } from "@/types";

export interface CatalogFilters {
  department?: Department;
  category?: string;
  manufacturer?: string;
  scale?: string;
  /** Inclusive range for the product's manufacturer minimum age, e.g. [3, 5]. */
  ageBand?: readonly [number, number];
  query?: string;
}

/** Pure filtering so the same rules apply to every data source and are unit-testable. */
export function filterProducts(products: readonly Product[], f: CatalogFilters): Product[] {
  const q = f.query?.trim().toLowerCase();
  return products.filter((p) => {
    if (f.department && p.department !== f.department) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.manufacturer && p.manufacturer !== f.manufacturer) return false;
    if (f.scale && p.scale !== f.scale) return false;
    if (f.ageBand && (p.ageMin === null || p.ageMin < f.ageBand[0] || p.ageMin > f.ageBand[1])) return false;
    if (q && !`${p.name} ${p.category} ${p.manufacturer ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const byOccasion = (products: readonly Product[], occasion: Occasion) =>
  products.filter((p) => p.occasions.includes(occasion));

export const distinct = (values: readonly (string | null)[]): string[] =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort();

export const ageBands = [
  { id: "0-2", label: "0–2 years", range: [0, 2] },
  { id: "3-5", label: "3–5 years", range: [3, 5] },
  { id: "6-8", label: "6–8 years", range: [6, 8] },
  { id: "9-12", label: "9–12 years", range: [9, 12] },
  { id: "13-99", label: "13+ years", range: [13, 99] },
] as const;
