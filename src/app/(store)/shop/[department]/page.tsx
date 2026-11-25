import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilterBar, type FilterGroup } from "@/components/products/FilterBar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ageBands, distinct, filterProducts } from "@/services/catalog";
import { getProducts } from "@/services/products";
import type { Department } from "@/types";

export const revalidate = 60;

const departments: Record<Department, { title: string; intro: string; description: string }> = {
  kids: {
    title: "Children's toy cars",
    intro: "Toys chosen for play. Every product shows the manufacturer's recommended age and safety notes.",
    description: "Remote-control cars, ride-on cars, race tracks and toy car gift sets for children, with clear age guidance.",
  },
  collectors: {
    title: "Collectors' diecast and display models",
    intro: "Detailed miniature automobiles for adult collectors. These are display models, not toys.",
    description: "Diecast collectible cars from 1:18 to 1:64: luxury supercars, classics, Formula 1 models and limited editions.",
  },
};

type Params = Promise<{ department: string }>;
type Search = Promise<Record<string, string | undefined>>;

const isDepartment = (v: string): v is Department => v === "kids" || v === "collectors";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { department } = await params;
  if (!isDepartment(department)) return {};
  const d = departments[department];
  return { title: d.title, description: d.description, alternates: { canonical: `/shop/${department}` } };
}

export default async function ShopPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { department } = await params;
  if (!isDepartment(department)) notFound();
  const search = await searchParams;

  const all = (await getProducts()).filter((p) => p.department === department);
  const band = ageBands.find((b) => b.id === search.age);

  const products = filterProducts(all, {
    category: search.category,
    manufacturer: search.manufacturer,
    scale: search.scale,
    ageBand: band?.range,
  });

  const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));
  const groups: FilterGroup[] = [
    { param: "category", label: "Category", options: toOptions(distinct(all.map((p) => p.category))) },
    ...(department === "kids"
      ? [{ param: "age", label: "Age", options: ageBands.map((b) => ({ value: b.id, label: b.label })) }]
      : [
          { param: "scale", label: "Scale", options: toOptions(distinct(all.map((p) => p.scale))) },
          { param: "manufacturer", label: "Make", options: toOptions(distinct(all.map((p) => p.manufacturer))) },
        ]),
  ];

  const d = departments[department];
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: department === "kids" ? "Kids" : "Collectors", href: `/shop/${department}` }]} />
      <header className="max-w-2xl">
        <h1 className="text-4xl">{d.title}</h1>
        <p className="mt-3 text-charcoal/75">{d.intro}</p>
      </header>
      <FilterBar basePath={`/shop/${department}`} groups={groups} active={search} />
      <p className="text-sm text-charcoal/60" aria-live="polite">{products.length} products</p>
      <ProductGrid key={JSON.stringify(search)} products={products} />
    </div>
  );
}
