import { currencies } from "@/config/site";
import type { CurrencyCode } from "@/types";

/** Price after percentage discount, still in GBP minor units. */
export function discountedMinor(priceMinor: number, discountPercent: number): number {
  return Math.round(priceMinor * (1 - discountPercent / 100));
}

/** Convert GBP minor units to an indicative amount in another currency. */
export function convertMinor(gbpMinor: number, to: CurrencyCode): number {
  const rate = currencies.find((c) => c.code === to)?.rateFromGbp ?? 1;
  return Math.round(gbpMinor * rate);
}

export function formatMoney(gbpMinor: number, currency: CurrencyCode = "GBP"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "GBP" ? 2 : 0,
  }).format(convertMinor(gbpMinor, currency) / 100);
}
