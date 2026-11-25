"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // "user" honours the visitor's reduced-motion setting across every animation.
    <MotionConfig reducedMotion="user">
      <CurrencyProvider>
        <CartProvider>{children}</CartProvider>
      </CurrencyProvider>
    </MotionConfig>
  );
}
