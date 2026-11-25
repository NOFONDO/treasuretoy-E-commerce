"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Price } from "@/components/products/Price";
import { ProductImage } from "@/components/products/ProductImage";
import type { Product } from "@/types";

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-medium text-navy">{children}</span>;
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy/10 transition-shadow duration-300 hover:shadow-xl hover:shadow-navy/10">
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <ProductImage image={product.images[0]} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" priority={priority} />
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isLimited && <Badge>Limited</Badge>}
          {product.isNew && <Badge>New</Badge>}
          {product.discountPercent > 0 && <Badge>{`-${product.discountPercent}%`}</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs text-gold-deep">{product.manufacturer ?? product.category}</p>
          <h3 className="mt-0.5 text-lg leading-snug">
            <Link href={`/products/${product.slug}`} className="hover:underline">{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-charcoal/70">
            {product.department === "collectors"
              ? `${product.scale} scale · ages ${product.ageMin}+`
              : `Ages ${product.ageMin}+`}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <Price priceMinor={product.priceMinor} discountPercent={product.discountPercent} />
          <AddToCartButton product={product} className="px-4" />
        </div>
      </div>
    </article>
  );
}
