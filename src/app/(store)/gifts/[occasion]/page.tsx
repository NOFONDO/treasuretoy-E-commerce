import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { isOccasion, occasions } from "@/config/occasions";
import { byOccasion } from "@/services/catalog";
import { getProducts } from "@/services/products";

export const revalidate = 60;

type Params = Promise<{ occasion: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { occasion } = await params;
  if (!isOccasion(occasion)) return {};
  const o = occasions[occasion];
  return { title: o.title, description: o.description, alternates: { canonical: `/gifts/${occasion}` } };
}

export default async function OccasionPage({ params }: { params: Params }) {
  const { occasion } = await params;
  if (!isOccasion(occasion)) notFound();

  const gifts = byOccasion(await getProducts(), occasion);
  const forChildren = gifts.filter((p) => p.audience === "children");
  const forCollectors = gifts.filter((p) => p.audience === "collectors");
  const o = occasions[occasion];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gift Centre", href: "/gifts" }, { label: o.title, href: `/gifts/${occasion}` }]} />
      <header className="max-w-2xl">
        <h1 className="text-4xl">{o.title}</h1>
        <p className="mt-3 text-charcoal/75">{o.blurb}</p>
      </header>
      {forChildren.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl">For children</h2>
          <ProductGrid products={forChildren} />
        </section>
      )}
      {forCollectors.length > 0 && (
        <section>
          <h2 className="mb-1 text-2xl">For collectors</h2>
          <p className="mb-6 text-sm text-charcoal/65">Adult display models, not suitable for young children.</p>
          <ProductGrid products={forCollectors} />
        </section>
      )}
      {gifts.length === 0 && <ProductGrid products={[]} />}
    </div>
  );
}
