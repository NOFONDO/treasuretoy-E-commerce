"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import { discountedMinor } from "@/lib/money";
import { cn } from "@/lib/utils";

interface Props {
  priceMinor: number;
  discountPercent?: number;
  className?: string;
}

export function Price({ priceMinor, discountPercent = 0, className }: Props) {
  const { format } = useCurrency();
  const final = discountedMinor(priceMinor, discountPercent);

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-semibold text-navy">{format(final)}</span>
      {discountPercent > 0 && <s className="text-sm text-charcoal/60">{format(priceMinor)}</s>}
    </span>
  );
}
