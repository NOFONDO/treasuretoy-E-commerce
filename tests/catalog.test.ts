import { describe, expect, it } from "vitest";
import { sampleProducts } from "@/data/sample-products";
import { filterProducts } from "@/services/catalog";
import { budgetBands, findGifts } from "@/services/gift-finder";
import { buildEnquiryMessage } from "@/lib/whatsapp";
import { discountedMinor } from "@/lib/money";

describe("gift finder safety rules", () => {
  it("never returns collectibles for a child", () => {
    const results = findGifts(sampleProducts, { recipient: "child", age: 8 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.audience === "children")).toBe(true);
  });

  it("respects the child's age", () => {
    const results = findGifts(sampleProducts, { recipient: "child", age: 2 });
    expect(results.every((p) => p.ageMin !== null && p.ageMin <= 2)).toBe(true);
  });

  it("only returns collectibles for collectors", () => {
    const results = findGifts(sampleProducts, { recipient: "collector" });
    expect(results.every((p) => p.audience === "collectors")).toBe(true);
  });

  it("excludes out-of-stock items and honours budget", () => {
    const stock = sampleProducts.map((p, i) => (i === 0 ? { ...p, stock: 0 } : p));
    const results = findGifts(stock, { recipient: "child", age: 10, budgetMinor: budgetBands[0] });
    expect(results.find((p) => p.id === stock[0]!.id)).toBeUndefined();
    expect(results.every((p) => p.priceMinor <= 2499)).toBe(true);
  });
});

describe("catalog filters", () => {
  it("filters by department and scale", () => {
    const r = filterProducts(sampleProducts, { department: "collectors", scale: "1:18" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.scale === "1:18")).toBe(true);
  });
});

describe("money and enquiry message", () => {
  it("applies discounts in minor units", () => {
    expect(discountedMinor(1000, 10)).toBe(900);
  });

  it("builds a readable enquiry", () => {
    const msg = buildEnquiryMessage({
      reference: "TT-ABC123",
      name: "Ada",
      country: "UK",
      lines: [{ name: "Velocity RC Racer", sku: "K1", quantity: 2 }],
    });
    expect(msg).toContain("Velocity RC Racer (SKU K1) x 2");
    expect(msg).toContain("TT-ABC123");
  });
});

describe("teenager recipients", () => {
  it("can receive collectibles only if they meet the minimum age", () => {
    const at13 = findGifts(sampleProducts, { recipient: "teenager", age: 13 });
    expect(at13.some((p) => p.audience === "collectors")).toBe(false);
    const at15 = findGifts(sampleProducts, { recipient: "teenager", age: 15 });
    expect(at15.some((p) => p.audience === "collectors")).toBe(true);
  });
});
