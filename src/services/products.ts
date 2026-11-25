import { sampleProducts } from "@/data/sample-products";
import { getPublicClient } from "@/lib/supabase/public";
import type { Occasion, Product } from "@/types";

export interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  department: Product["department"];
  audience: Product["audience"];
  category: string;
  manufacturer: string | null;
  scale: string | null;
  price_minor: number;
  discount_percent: number;
  stock: number;
  age_min: number | null;
  safety_notes: string | null;
  occasions: Occasion[];
  is_featured: boolean;
  is_limited: boolean;
  is_new: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  product_images: { url: string; alt: string; position: number; is_featured: boolean }[];
  product_videos: { url: string; position: number }[];
}

export const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  sku: r.sku,
  name: r.name,
  description: r.description,
  department: r.department,
  audience: r.audience,
  category: r.category,
  manufacturer: r.manufacturer,
  scale: r.scale,
  priceMinor: r.price_minor,
  discountPercent: r.discount_percent,
  stock: r.stock,
  ageMin: r.age_min,
  safetyNotes: r.safety_notes,
  occasions: r.occasions ?? [],
  isFeatured: r.is_featured,
  isLimited: r.is_limited,
  isNew: r.is_new,
  isPublished: r.is_published,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  images: [...r.product_images]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.position - b.position)
    .map(({ url, alt }) => ({ url, alt })),
  videos: [...(r.product_videos ?? [])].sort((a, b) => a.position - b.position).map((v) => v.url),
});

export const PRODUCT_SELECT = "*, product_images(url, alt, position, is_featured), product_videos(url, position)";

/** All published products. Falls back to sample data when Supabase is not configured. */
export async function getProducts(): Promise<Product[]> {
  const client = getPublicClient();
  if (!client) return sampleProducts;

  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
