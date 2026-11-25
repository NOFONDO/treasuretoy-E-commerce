import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { filterProducts } from "@/services/catalog";
import { getProducts } from "@/services/products";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? filterProducts(await getProducts(), { query: q }) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <h1 className="text-4xl">{q ? `Results for "${q}"` : "Search"}</h1>
      <ProductGrid key={q} products={results} />
    </div>
  );
}
