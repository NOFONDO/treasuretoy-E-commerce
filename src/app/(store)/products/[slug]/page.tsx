import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldAlert } from "lucide-react";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Price } from "@/components/products/Price";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { discountedMinor } from "@/lib/money";
import { whatsappUrl } from "@/lib/whatsapp";
import { getProductBySlug, getProducts } from "@/services/products";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.seoTitle ?? product.name, description: product.seoDescription ?? product.description.slice(0, 155), images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const related = (await getProducts())
    .filter((p) => p.department === product.department && p.id !== product.id)
    .slice(0, 4);

  const isCollector = product.department === "collectors";
  const askUrl = whatsappUrl(`Hello ${siteConfig.name}, I have a question about ${product.name} (SKU ${product.sku}).`);

  const specs: [string, string | null][] = [
    ["SKU", product.sku],
    ["Category", product.category],
    ["Make", product.manufacturer],
    ["Scale", product.scale],
    ["Recommended age", product.ageMin !== null ? `${product.ageMin}+` : null],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: isCollector ? "Collectors" : "Kids", href: `/shop/${product.department}` },
          { label: product.name, href: `/products/${product.slug}` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl">{product.name}</h1>
            <p className="mt-3 text-2xl"><Price priceMinor={product.priceMinor} discountPercent={product.discountPercent} /></p>
            <p className="mt-1 text-xs text-charcoal/60">Indicative price. Final price and delivery are confirmed with you on WhatsApp.</p>
          </div>

          <p className="leading-relaxed text-charcoal/85">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} className="px-8 py-3" />
            {askUrl && (
              <a href={askUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-navy ring-1 ring-navy/30 hover:bg-navy/5">
                <MessageCircle className="size-4" aria-hidden /> Ask about this car
              </a>
            )}
          </div>

          {product.safetyNotes && (
            <aside className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-gold/50">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
              <div className="text-sm">
                <p className="font-medium text-navy">{isCollector ? "Collector's model, not a toy" : "Safety information"}</p>
                <p className="mt-1 text-charcoal/80">{product.safetyNotes}</p>
              </div>
            </aside>
          )}

          <dl className="divide-y divide-navy/10 rounded-2xl bg-white ring-1 ring-navy/10">
            {specs.filter((s): s is [string, string] => s[1] !== null).map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-charcoal/65">{k}</dt>
                <dd className="font-medium text-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {product.videos.length > 0 && (
        <section aria-labelledby="videos" className="space-y-4">
          <h2 id="videos" className="text-2xl">See it in action</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.videos.map((src) => (
              <video key={src} controls preload="metadata" playsInline className="w-full rounded-2xl bg-navy" src={src} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <SectionHeading title="You may also like" />
          <ProductGrid products={related} />
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.sku,
          image: product.images.map((i) => i.url),
          brand: product.manufacturer ? { "@type": "Brand", name: product.manufacturer } : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            price: (discountedMinor(product.priceMinor, product.discountPercent) / 100).toFixed(2),
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${siteConfig.url}/products/${product.slug}`,
          },
        }}
      />
    </div>
  );
}
