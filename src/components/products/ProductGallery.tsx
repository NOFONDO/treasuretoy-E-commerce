"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ProductImage } from "@/components/products/ProductImage";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

export function ProductGallery({ images }: { images: ProductImageType[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current?.url ?? "placeholder"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ProductImage image={current} sizes="(min-width:1024px) 50vw, 100vw" priority />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <li key={img.url}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === index} className={cn("block w-full overflow-hidden rounded-lg ring-2 ring-offset-2", i === index ? "ring-gold" : "ring-transparent")}>
                <ProductImage image={img} sizes="100px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
