export type Department = "kids" | "collectors";
export type Audience = "children" | "collectors";
export type Occasion = "birthday" | "christmas" | "premium";
export type CurrencyCode = "GBP" | "USD" | "AED" | "AUD" | "CAD";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  department: Department;
  /** Who the product is safe and appropriate for. Drives the gift finder. */
  audience: Audience;
  category: string;
  manufacturer: string | null;
  /** Model scale such as "1:18". Collectibles only. */
  scale: string | null;
  /** Base price in GBP minor units (pence). Final price is agreed on WhatsApp. */
  priceMinor: number;
  discountPercent: number;
  stock: number;
  /** Manufacturer's minimum recommended age. */
  ageMin: number | null;
  safetyNotes: string | null;
  occasions: Occasion[];
  isFeatured: boolean;
  isLimited: boolean;
  isNew: boolean;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImage[];
  videos: string[];
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  priceMinor: number;
  image: ProductImage | null;
  quantity: number;
}
