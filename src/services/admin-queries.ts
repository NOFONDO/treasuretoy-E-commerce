import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SELECT, toProduct, type ProductRow } from "@/services/products";
import type { Product } from "@/types";

export interface AdminImage { id: string; url: string; alt: string }
export interface AdminVideo { id: string; url: string }

/** Admin reads go through the signed-in session, so RLS also exposes unpublished products. */
export async function listAdminProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(toProduct);
}

export async function getAdminProduct(supabase: SupabaseClient, id: string) {
  const { data: row } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (!row) return null;

  const [{ data: images }, { data: videos }] = await Promise.all([
    supabase.from("product_images").select("id, url, alt").eq("product_id", id).order("position"),
    supabase.from("product_videos").select("id, url").eq("product_id", id).order("position"),
  ]);

  return {
    product: toProduct(row as ProductRow),
    images: (images ?? []) as AdminImage[],
    videos: (videos ?? []) as AdminVideo[],
  };
}

export interface AdminEnquiry {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  country: string;
  notes: string | null;
  status: string;
  created_at: string;
  enquiry_items: { product_name: string; sku: string; quantity: number; unit_price_minor: number }[];
}

export async function listEnquiries(supabase: SupabaseClient, limit = 100): Promise<AdminEnquiry[]> {
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, enquiry_items(product_name, sku, quantity, unit_price_minor)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as AdminEnquiry[];
}
