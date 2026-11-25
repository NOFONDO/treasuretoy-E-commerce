import type { Metadata } from "next";
import { GiftFinder } from "@/components/gifts/GiftFinder";
import { getProducts } from "@/services/products";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Gift Finder",
  description: "Answer a few questions and we will suggest toy car gifts matched to age, occasion and budget.",
  alternates: { canonical: "/gift-finder" },
};

export default async function GiftFinderPage() {
  const products = await getProducts();
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-4xl">Find the perfect gift</h1>
        <p className="mt-3 text-charcoal/75">Five quick questions. Adult collectibles are never suggested for young children.</p>
      </header>
      <GiftFinder products={products} />
    </div>
  );
}
