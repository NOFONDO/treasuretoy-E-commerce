"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MEDIA_BUCKET, publicMediaPrefix } from "@/config/media";
import { requireAdmin, type AdminContext } from "@/lib/admin-auth";
import { getSessionClient } from "@/lib/supabase/server";
import { parseProductForm, toProductRow } from "@/services/product-input";

export interface FormState {
  error?: string;
  saved?: boolean;
}

type Result = { error?: string };

/** Make edits visible on the public site immediately instead of after the cache window. */
function refreshPublicSite() {
  revalidatePath("/", "layout");
}

async function audit({ supabase, user }: AdminContext, action: string, entity: string, entityId?: string) {
  const { error } = await supabase.from("audit_logs").insert({ actor_id: user.id, action, entity, entity_id: entityId ?? null });
  if (error) console.error("audit log failed", error.message);
}

/** Storage path of an object from its public URL, or null if it is not in our bucket. */
const storagePath = (url: string) => url.split(`/object/public/${MEDIA_BUCKET}/`)[1] ?? null;

// ---------------------------------------------------------------- auth

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await getSessionClient();
  if (!supabase) return { error: "Supabase is not configured. See the README." };

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "Incorrect email or password." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await getSessionClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

// ------------------------------------------------------------- products

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const row = toProductRow(parsed.data);
  const query = id
    ? ctx.supabase.from("products").update(row).eq("id", id).select("id").single()
    : ctx.supabase.from("products").insert(row).select("id").single();

  const { data, error } = await query;
  if (error) return { error: error.code === "23505" ? "That SKU or URL slug is already in use." : error.message };

  await audit(ctx, id ? "product.update" : "product.create", "product", data.id);
  refreshPublicSite();
  revalidatePath("/admin", "layout");

  if (!id) redirect(`/admin/products/${data.id}?created=1`);
  return { saved: true };
}

export async function setPublished(productId: string, published: boolean): Promise<Result> {
  const ctx = await requireAdmin();
  const { error } = await ctx.supabase.from("products").update({ is_published: published }).eq("id", productId);
  if (error) return { error: error.message };
  await audit(ctx, published ? "product.publish" : "product.unpublish", "product", productId);
  refreshPublicSite();
  revalidatePath("/admin/products");
  return {};
}

export async function deleteProduct(productId: string): Promise<Result> {
  const ctx = await requireAdmin();

  // Remove uploaded files first: deleting the row cascades to media rows but not to Storage.
  const [{ data: images }, { data: videos }] = await Promise.all([
    ctx.supabase.from("product_images").select("url").eq("product_id", productId),
    ctx.supabase.from("product_videos").select("url").eq("product_id", productId),
  ]);
  const paths = [...(images ?? []), ...(videos ?? [])].flatMap((m) => storagePath(m.url) ?? []);
  if (paths.length) await ctx.supabase.storage.from(MEDIA_BUCKET).remove(paths);

  const { error } = await ctx.supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  await audit(ctx, "product.delete", "product", productId);
  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return {};
}

// --------------------------------------------------------------- media

/** Only accept URLs that point into this product's own folder in our bucket. */
const isOwnMedia = (productId: string, url: string) => url.startsWith(publicMediaPrefix(productId));

export async function addImage(productId: string, url: string, alt: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!isOwnMedia(productId, url)) return { error: "Invalid file location." };

  const { count } = await ctx.supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  const position = count ?? 0;
  const { error } = await ctx.supabase
    .from("product_images")
    .insert({ product_id: productId, url, alt: alt.trim().slice(0, 200) || "Product photo", position, is_featured: position === 0 });
  if (error) return { error: error.message };

  await audit(ctx, "image.add", "product", productId);
  refreshPublicSite();
  return {};
}

export async function updateImageAlt(imageId: string, alt: string): Promise<Result> {
  const ctx = await requireAdmin();
  const { error } = await ctx.supabase.from("product_images").update({ alt: alt.trim().slice(0, 200) }).eq("id", imageId);
  if (error) return { error: error.message };
  refreshPublicSite();
  return {};
}

/** Rewrites positions so the first image is the featured one. */
async function applyImageOrder({ supabase }: AdminContext, orderedIds: string[]): Promise<Result> {
  for (const [position, id] of orderedIds.entries()) {
    const { error } = await supabase.from("product_images").update({ position, is_featured: position === 0 }).eq("id", id);
    if (error) return { error: error.message };
  }
  return {};
}

async function imageIds(ctx: AdminContext, productId: string): Promise<string[]> {
  const { data } = await ctx.supabase.from("product_images").select("id").eq("product_id", productId).order("position");
  return (data ?? []).map((r) => r.id as string);
}

export async function moveImage(productId: string, imageId: string, direction: -1 | 1): Promise<Result> {
  const ctx = await requireAdmin();
  const ids = await imageIds(ctx, productId);
  const from = ids.indexOf(imageId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return {};
  [ids[from], ids[to]] = [ids[to]!, ids[from]!];
  const result = await applyImageOrder(ctx, ids);
  refreshPublicSite();
  return result;
}

export async function makeFeaturedImage(productId: string, imageId: string): Promise<Result> {
  const ctx = await requireAdmin();
  const ids = await imageIds(ctx, productId);
  const result = await applyImageOrder(ctx, [imageId, ...ids.filter((id) => id !== imageId)]);
  refreshPublicSite();
  return result;
}

export async function deleteImage(productId: string, imageId: string): Promise<Result> {
  const ctx = await requireAdmin();
  const { data } = await ctx.supabase.from("product_images").select("url").eq("id", imageId).eq("product_id", productId).single();
  const { error } = await ctx.supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  const path = data ? storagePath(data.url) : null;
  if (path) await ctx.supabase.storage.from(MEDIA_BUCKET).remove([path]);

  // Keep the first remaining image featured.
  await applyImageOrder(ctx, await imageIds(ctx, productId));
  await audit(ctx, "image.delete", "product", productId);
  refreshPublicSite();
  return {};
}

export async function addVideo(productId: string, url: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!isOwnMedia(productId, url)) return { error: "Invalid file location." };

  const { count } = await ctx.supabase.from("product_videos").select("id", { count: "exact", head: true }).eq("product_id", productId);
  const { error } = await ctx.supabase.from("product_videos").insert({ product_id: productId, url, position: count ?? 0 });
  if (error) return { error: error.message };

  await audit(ctx, "video.add", "product", productId);
  refreshPublicSite();
  return {};
}

export async function deleteVideo(productId: string, videoId: string): Promise<Result> {
  const ctx = await requireAdmin();
  const { data } = await ctx.supabase.from("product_videos").select("url").eq("id", videoId).eq("product_id", productId).single();
  const { error } = await ctx.supabase.from("product_videos").delete().eq("id", videoId);
  if (error) return { error: error.message };

  const path = data ? storagePath(data.url) : null;
  if (path) await ctx.supabase.storage.from(MEDIA_BUCKET).remove([path]);

  await audit(ctx, "video.delete", "product", productId);
  refreshPublicSite();
  return {};
}

// ----------------------------------------------------------- enquiries

const enquiryStatuses = ["new", "contacted", "agreed", "delivered", "cancelled"] as const;

export async function updateEnquiryStatus(enquiryId: string, status: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!enquiryStatuses.includes(status as (typeof enquiryStatuses)[number])) return { error: "Invalid status." };

  const { error } = await ctx.supabase.from("enquiries").update({ status }).eq("id", enquiryId);
  if (error) return { error: error.message };

  await audit(ctx, `enquiry.${status}`, "enquiry", enquiryId);
  revalidatePath("/admin", "layout");
  return {};
}
