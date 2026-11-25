import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { occasions } from "@/config/occasions";

export const metadata: Metadata = {
  title: "Gift Centre",
  description: "Birthday, Christmas and premium toy car gifts for children and collectors.",
  alternates: { canonical: "/gifts" },
};

export default function GiftsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gift Centre", href: "/gifts" }]} />
      <header className="max-w-2xl">
        <h1 className="text-4xl">The gift centre</h1>
        <p className="mt-3 text-charcoal/75">Start with the occasion, or let the gift finder narrow it down by age and budget.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(occasions).map(([slug, o]) => (
          <Link key={slug} href={`/gifts/${slug}`} className="rounded-3xl bg-white p-8 ring-1 ring-navy/10 transition-shadow hover:shadow-xl">
            <h2 className="text-2xl">{o.title}</h2>
            <p className="mt-2 text-charcoal/70">{o.blurb}</p>
          </Link>
        ))}
      </div>
      <Link href="/gift-finder" className="inline-block rounded-full bg-navy px-7 py-3 text-white">Find the perfect gift</Link>
    </div>
  );
}
