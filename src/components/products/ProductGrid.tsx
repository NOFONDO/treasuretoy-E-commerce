"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-charcoal/70 ring-1 ring-navy/10">
        No products match these filters. Clear a filter or message us and we will source it for you.
      </p>
    );
  }

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product, i) => (
        <motion.li key={product.id} variants={item}>
          <ProductCard product={product} priority={i < 4} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
