"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { ProductImage } from "@/components/products/ProductImage";

export function CartDrawer() {
  const { items, isOpen, close, subtotalMinor, setQuantity, remove } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-navy/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <header className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
              <h2 className="text-xl">Your cart</h2>
              <button type="button" onClick={close} aria-label="Close cart" className="rounded-full p-2 hover:bg-navy/5">
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-charcoal/70">Your cart is empty. Add a car you love and we will take it from there.</p>
                <Link href="/shop/kids" onClick={close} className="rounded-full bg-navy px-5 py-2.5 text-sm text-white">
                  Browse the shop
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-navy/10 overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 py-4"
                      >
                        <div className="w-20 shrink-0 overflow-hidden rounded-lg">
                          <ProductImage image={item.image} sizes="80px" />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <Link href={`/products/${item.slug}`} onClick={close} className="font-medium text-navy hover:underline">
                            {item.name}
                          </Link>
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full ring-1 ring-navy/20">
                              <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => setQuantity(item.productId, item.quantity - 1)} className="p-2 disabled:opacity-30">
                                <Minus className="size-3.5" />
                              </button>
                              <span className="min-w-6 text-center text-sm" aria-live="polite">{item.quantity}</span>
                              <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => setQuantity(item.productId, item.quantity + 1)} className="p-2">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-medium">{format(item.priceMinor * item.quantity)}</span>
                          </div>
                          <button type="button" onClick={() => remove(item.productId)} className="inline-flex w-fit items-center gap-1 text-xs text-charcoal/60 hover:text-navy">
                            <Trash2 className="size-3.5" aria-hidden /> Remove
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="space-y-3 border-t border-navy/10 p-5">
                  <div className="flex items-center justify-between">
                    <span>Estimated total</span>
                    <span className="text-lg font-semibold text-navy">{format(subtotalMinor)}</span>
                  </div>
                  <p className="text-xs text-charcoal/70">
                    No payment on this site. We confirm the final price, delivery and payment method with you on WhatsApp.
                  </p>
                  <Link href="/enquiry" onClick={close} className="block rounded-full bg-gold px-5 py-3 text-center font-medium text-navy transition-colors hover:bg-gold/90">
                    Order on WhatsApp
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
