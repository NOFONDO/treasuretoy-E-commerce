import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/supabase/admin";
import { buildEnquiryMessage, mailtoUrl, whatsappUrl } from "@/lib/whatsapp";
import { getProducts } from "@/services/products";

// Strip control characters so pasted text cannot break the WhatsApp message.
const clean = (max: number) =>
  z.string().trim().max(max).transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, " "));

const bodySchema = z.object({
  name: clean(80).pipe(z.string().min(2)),
  country: clean(60).pipe(z.string().min(2)),
  email: z.union([z.literal(""), z.string().trim().max(120).pipe(z.email())]).optional(),
  phone: clean(30).optional(),
  notes: clean(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(10) })).min(1).max(30),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`enquiry:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  const input = parsed.data;

  // Never trust names, SKUs or prices from the browser: rebuild lines from the catalogue.
  const catalogue = new Map((await getProducts()).map((p) => [p.id, p]));
  const lines = input.items.flatMap(({ productId, quantity }) => {
    const product = catalogue.get(productId);
    return product ? [{ product, quantity }] : [];
  });
  if (lines.length === 0) {
    return NextResponse.json({ error: "Those items are no longer available." }, { status: 409 });
  }

  const reference = `TT-${randomBytes(4).toString("hex").toUpperCase()}`;
  const message = buildEnquiryMessage({
    reference,
    name: input.name,
    country: input.country,
    notes: input.notes || undefined,
    lines: lines.map(({ product, quantity }) => ({ name: product.name, sku: product.sku, quantity })),
  });

  // Saving is best-effort: a database outage must never stop a customer reaching us.
  let saved = false;
  const db = getAdminClient();
  if (db) {
    const { data, error } = await db
      .from("enquiries")
      .insert({
        reference,
        customer_name: input.name,
        customer_email: input.email || null,
        customer_phone: input.phone || null,
        country: input.country,
        notes: input.notes || null,
      })
      .select("id")
      .single();

    if (!error && data) {
      const { error: itemsError } = await db.from("enquiry_items").insert(
        lines.map(({ product, quantity }) => ({
          enquiry_id: data.id,
          product_id: product.id.startsWith("sample-") ? null : product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price_minor: product.priceMinor,
          quantity,
        })),
      );
      saved = !itemsError;
      if (itemsError) console.error("enquiry_items insert failed", itemsError.message);
    } else {
      console.error("enquiries insert failed", error?.message);
    }
  }

  return NextResponse.json({
    reference,
    saved,
    whatsappUrl: whatsappUrl(message),
    emailUrl: mailtoUrl(`Order enquiry ${reference}`, message),
  });
}
