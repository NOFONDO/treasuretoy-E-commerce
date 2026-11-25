import { describe, expect, it } from "vitest";
import { parseProductForm, toProductRow } from "@/services/product-input";

function form(overrides: Record<string, string> = {}, occasions: string[] = []) {
  const f = new FormData();
  const base: Record<string, string> = {
    name: "Velocity RC Racer", slug: "", sku: "K-001", description: "Fast car", department: "kids",
    category: "Remote Control Cars", price: "39.99", discount: "0", stock: "5", ageMin: "6",
  };
  for (const [k, v] of Object.entries({ ...base, ...overrides })) f.set(k, v);
  occasions.forEach((o) => f.append("occasions", o));
  return f;
}

describe("product form parsing", () => {
  it("converts pounds to minor units and derives audience and slug", () => {
    const parsed = parseProductForm(form({}, ["birthday"]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const row = toProductRow(parsed.data);
    expect(row.price_minor).toBe(3999);
    expect(row.audience).toBe("children");
    expect(row.slug).toBe("velocity-rc-racer");
    expect(row.occasions).toEqual(["birthday"]);
  });

  it("rejects collectibles aimed at children", () => {
    expect(parseProductForm(form({ department: "collectors", ageMin: "8" })).success).toBe(false);
  });

  it("requires a minimum age for toys", () => {
    expect(parseProductForm(form({ ageMin: "" })).success).toBe(false);
  });

  it("drops scale for kids' products", () => {
    const parsed = parseProductForm(form({ scale: "1:18" }));
    expect(parsed.success && toProductRow(parsed.data).scale).toBe(null);
  });
});
