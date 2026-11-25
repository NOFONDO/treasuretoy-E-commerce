"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { currencies, nav, siteConfig } from "@/config/site";
import type { CurrencyCode } from "@/types";

export function Header() {
  const router = useRouter();
  const { count, open } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button type="button" className="lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <Menu className="size-6" />
        </button>

        <Link href="/" className="font-display text-lg tracking-wide text-gold sm:text-xl">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-5 text-sm lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/80 transition-colors hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="rounded-md bg-navy-soft px-2 py-1.5 text-xs text-white"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>

          <button type="button" aria-label="Search" onClick={() => setSearchOpen((v) => !v)} className="rounded-full p-2 hover:bg-white/10">
            <Search className="size-5" />
          </button>

          <button type="button" aria-label={`Open cart, ${count} items`} onClick={open} className="relative rounded-full p-2 hover:bg-white/10">
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold text-xs font-semibold text-navy"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.form
            onSubmit={onSearch}
            role="search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-navy-soft"
          >
            <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3 sm:px-6">
              <input
                name="q"
                autoFocus
                type="search"
                placeholder="Search toy cars, brands, scales…"
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-charcoal"
                aria-label="Search products"
              />
              <button type="submit" className="rounded-full bg-gold px-5 text-sm font-medium text-navy">Search</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} aria-hidden />
            <motion.nav
              aria-label="Mobile"
              className="fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col gap-1 bg-navy p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 340 }}
            >
              <button type="button" aria-label="Close menu" className="mb-4 self-end" onClick={() => setMenuOpen(false)}>
                <X className="size-6" />
              </button>
              {[{ href: "/", label: "Home" }, ...nav, { href: "/about", label: "About us" }, { href: "/contact", label: "Contact" }].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-lg text-white/90 hover:bg-white/10 hover:text-gold">
                  {item.label}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
