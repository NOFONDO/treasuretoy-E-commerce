import type { CurrencyCode } from "@/types";

export const siteConfig = {
  name: "TREASURE_TOYSHOP",
  tagline: "Little Cars. Big Dreams. Exceptional Gifts.",
  description:
    "Premium toy cars, diecast collectibles and unforgettable gifts for children and collectors. Order by WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;

export interface CurrencyInfo {
  code: CurrencyCode;
  label: string;
  country: string;
  /** Indicative rate from GBP. Display only; the agreed price is confirmed on WhatsApp. */
  rateFromGbp: number;
}

export const currencies: readonly CurrencyInfo[] = [
  { code: "GBP", label: "£ GBP", country: "United Kingdom", rateFromGbp: 1 },
  { code: "USD", label: "$ USD", country: "United States", rateFromGbp: 1.27 },
  { code: "AED", label: "AED", country: "United Arab Emirates", rateFromGbp: 4.66 },
  { code: "AUD", label: "A$ AUD", country: "Australia", rateFromGbp: 1.93 },
  { code: "CAD", label: "C$ CAD", country: "Canada", rateFromGbp: 1.73 },
];

export const nav = [
  { href: "/shop/kids", label: "Kids' Collection" },
  { href: "/shop/collectors", label: "Collectors" },
  { href: "/gifts/birthday", label: "Birthday Gifts" },
  { href: "/gifts/christmas", label: "Christmas" },
  { href: "/gifts/premium", label: "Premium Gifts" },
  { href: "/gift-finder", label: "Gift Finder" },
] as const;
