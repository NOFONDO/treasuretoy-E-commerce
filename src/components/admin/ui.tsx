"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg bg-white px-3 py-2.5 text-sm ring-1 ring-navy/20 focus:ring-2 focus:ring-gold-deep";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5 text-sm font-medium text-navy", className)}>
      {label}
      {children}
      {hint && <span className="block text-xs font-normal text-charcoal/60">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ children, pendingLabel = "Saving…" }: { children: ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-soft disabled:opacity-60">
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Badge({ tone, children }: { tone: "green" | "grey" | "amber" | "red"; children: ReactNode }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-800",
    grey: "bg-charcoal/10 text-charcoal",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-800",
  };
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}
