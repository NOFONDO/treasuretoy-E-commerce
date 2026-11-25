"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { currencies } from "@/config/site";

interface Result {
  reference: string;
  whatsappUrl: string | null;
  emailUrl: string | null;
}

const field = "w-full rounded-xl bg-white px-4 py-3 ring-1 ring-navy/15 focus:ring-2 focus:ring-gold-deep";

export function EnquiryForm() {
  const { items, subtotalMinor, clear } = useCart();
  const { format } = useCurrency();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          country: form.get("country"),
          email: form.get("email"),
          phone: form.get("phone"),
          notes: form.get("notes"),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setResult(data);
      clear();
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank", "noopener");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 rounded-3xl bg-white p-8 ring-1 ring-navy/10">
        <CheckCircle2 className="size-10 text-gold-deep" aria-hidden />
        <h2 className="text-3xl">Your order list is ready</h2>
        <p className="text-charcoal/75">
          Reference <strong className="text-navy">{result.reference}</strong>. Send it to us and we will confirm the price, delivery and payment options.
          If WhatsApp did not open, use a button below.
        </p>
        <div className="flex flex-wrap gap-3">
          {result.whatsappUrl && (
            <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-navy">
              <MessageCircle className="size-5" aria-hidden /> Send on WhatsApp
            </a>
          )}
          {result.emailUrl && (
            <a href={result.emailUrl} className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-navy ring-1 ring-navy/30">
              <Mail className="size-5" aria-hidden /> Send by email
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-navy/10">
        <p className="text-charcoal/75">Your cart is empty.</p>
        <Link href="/shop/kids" className="mt-4 inline-block rounded-full bg-navy px-6 py-3 text-white">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form onSubmit={onSubmit} className="space-y-4 lg:col-span-3">
        <label className="block space-y-1.5 text-sm font-medium">Full name
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium">Delivery country
            <select name="country" required defaultValue="" className={field}>
              <option value="" disabled>Select a country</option>
              {currencies.map((c) => <option key={c.code}>{c.country}</option>)}
              <option>Other</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Phone (optional)
            <input name="phone" type="tel" maxLength={30} autoComplete="tel" className={field} />
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">Email (optional)
          <input name="email" type="email" maxLength={120} autoComplete="email" className={field} />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Notes for us (optional)
          <textarea name="notes" rows={3} maxLength={500} placeholder="Gift message, preferred delivery date, questions…" className={field} />
        </label>
        {status === "error" && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 font-medium text-navy disabled:opacity-60">
          <MessageCircle className="size-5" aria-hidden />
          {status === "sending" ? "Preparing…" : "Continue on WhatsApp"}
        </button>
        <p className="text-xs text-charcoal/65">No payment is taken here. We agree price, delivery and payment with you directly.</p>
      </form>

      <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-navy/10 lg:col-span-2">
        <h2 className="text-xl">Your order</h2>
        <ul className="mt-4 divide-y divide-navy/10 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 py-2.5">
              <span>{i.name} <span className="text-charcoal/60">× {i.quantity}</span></span>
              <span>{format(i.priceMinor * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between font-semibold text-navy"><span>Estimated total</span><span>{format(subtotalMinor)}</span></p>
      </aside>
    </div>
  );
}
