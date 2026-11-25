import { siteConfig } from "@/config/site";

export interface EnquiryLine {
  name: string;
  sku: string;
  quantity: number;
}

export interface EnquiryDraft {
  reference: string;
  name: string;
  country: string;
  notes?: string;
  lines: EnquiryLine[];
}

export function buildEnquiryMessage(draft: EnquiryDraft): string {
  const items = draft.lines
    .map((l, i) => `${i + 1}. ${l.name} (SKU ${l.sku}) x ${l.quantity}`)
    .join("\n");

  return [
    `Hello ${siteConfig.name}, I would like to order:`,
    "",
    items,
    "",
    `Name: ${draft.name}`,
    `Delivery country: ${draft.country}`,
    draft.notes ? `Notes: ${draft.notes}` : null,
    `Reference: ${draft.reference}`,
    "",
    "Please confirm price, delivery and payment options.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function whatsappUrl(message?: string): string | null {
  const number = siteConfig.whatsappNumber.replace(/\D/g, "");
  if (!number) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}

export function mailtoUrl(subject: string, body: string): string | null {
  if (!siteConfig.contactEmail) return null;
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
