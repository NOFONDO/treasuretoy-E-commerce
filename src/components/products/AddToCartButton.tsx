"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({ product, quantity = 1, className }: Props) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = product.stock <= 0;

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  return (
    <motion.button
      type="button"
      disabled={soldOut}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        add(product, quantity);
        setJustAdded(true);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-charcoal/30",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={justAdded ? "added" : "idle"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-2"
          aria-live="polite"
        >
          {justAdded ? <Check className="size-4 text-gold" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
          {soldOut ? "Out of stock" : justAdded ? "Added to cart" : "Add to cart"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
