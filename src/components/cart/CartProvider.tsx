"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { z } from "zod";
import { discountedMinor } from "@/lib/money";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "tt-cart-v1";
export const MAX_LINE_QUANTITY = 10;

const storedCartSchema = z.array(
  z.object({
    productId: z.string(),
    slug: z.string(),
    name: z.string(),
    sku: z.string(),
    priceMinor: z.number().int().nonnegative(),
    image: z.object({ url: z.string(), alt: z.string() }).nullable(),
    quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
  }),
);

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

const clamp = (n: number) => Math.min(MAX_LINE_QUANTITY, Math.max(1, n));

function reducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = items.find((i) => i.productId === action.item.productId);
      if (!existing) return [...items, { ...action.item, quantity: clamp(action.quantity) }];
      return items.map((i) =>
        i.productId === action.item.productId ? { ...i, quantity: clamp(i.quantity + action.quantity) } : i,
      );
    }
    case "setQuantity":
      return items.map((i) => (i.productId === action.productId ? { ...i, quantity: clamp(action.quantity) } : i));
    case "remove":
      return items.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Estimated subtotal in GBP minor units. Final price is agreed on WhatsApp. */
  subtotalMinor: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = storedCartSchema.safeParse(JSON.parse(raw));
        if (parsed.success) dispatch({ type: "hydrate", items: parsed.data });
      }
    } catch {
      /* corrupted storage: start with an empty cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((product: Product, quantity = 1) => {
    dispatch({
      type: "add",
      quantity,
      item: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        priceMinor: discountedMinor(product.priceMinor, product.discountPercent),
        image: product.images[0] ?? null,
      },
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotalMinor: items.reduce((n, i) => n + i.priceMinor * i.quantity, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, isOpen, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
