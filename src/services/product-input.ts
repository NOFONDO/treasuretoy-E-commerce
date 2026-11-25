import { z } from "zod";
import { slugify } from "@/lib/slug";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    slug: z.string().trim().max(120),
    sku: z.string().trim().min(2, "SKU is required").max(40),
    description: z.string().trim().max(4000),
    department: z.enum(["kids", "collectors"]),
    category: z.string().trim().min(2, "Category is required").max(60),
    manufacturer: optionalText(60),
    scale: optionalText(10),
    /** Entered in pounds (e.g. 39.99). */
    price: z.coerce.number("Price must be a number").positive("Price must be above zero").max(100000),
    discount: z.coerce.number().int().min(0).max(100),
    stock: z.coerce.number().int().min(0).max(100000),
    // Blank must be rejected: Number("") is 0, which would mark a toy as suitable for any child.
    ageMin: z
      .string()
      .trim()
      .min(1, "Minimum age is required")
      .transform(Number)
      .pipe(z.number("Minimum age must be a number").int().min(0).max(99)),
    safetyNotes: optionalText(1000),
    seoTitle: optionalText(70),
    seoDescription: optionalText(160),
    occasions: z.array(z.enum(["birthday", "christmas", "premium"])),
    isFeatured: z.boolean(),
    isLimited: z.boolean(),
    isNew: z.boolean(),
    isPublished: z.boolean(),
  })
  // Safety rules: collectibles are adult display models; toys must state a real age.
  .superRefine((p, ctx) => {
    if (p.department === "collectors" && p.ageMin < 14) {
      ctx.addIssue({ code: "custom", path: ["ageMin"], message: "Collector models must be 14+ (they are not toys)." });
    }
    if (p.department === "kids" && p.ageMin > 17) {
      ctx.addIssue({ code: "custom", path: ["ageMin"], message: "Kids' products must be 17 or under." });
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

const text = (f: FormData, key: string) => String(f.get(key) ?? "");
const flag = (f: FormData, key: string) => f.get(key) === "on";

export function parseProductForm(formData: FormData) {
  return productInputSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    sku: text(formData, "sku"),
    description: text(formData, "description"),
    department: text(formData, "department"),
    category: text(formData, "category"),
    manufacturer: text(formData, "manufacturer"),
    scale: text(formData, "scale"),
    price: text(formData, "price"),
    discount: text(formData, "discount") || "0",
    stock: text(formData, "stock") || "0",
    ageMin: text(formData, "ageMin"),
    safetyNotes: text(formData, "safetyNotes"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    occasions: formData.getAll("occasions").map(String),
    isFeatured: flag(formData, "isFeatured"),
    isLimited: flag(formData, "isLimited"),
    isNew: flag(formData, "isNew"),
    isPublished: flag(formData, "isPublished"),
  });
}

/** Map validated form input to a database row. Audience is derived, never typed in. */
export function toProductRow(p: ProductInput) {
  return {
    name: p.name,
    slug: slugify(p.slug || p.name),
    sku: p.sku,
    description: p.description,
    department: p.department,
    audience: p.department === "kids" ? "children" : "collectors",
    category: p.category,
    manufacturer: p.manufacturer,
    scale: p.department === "collectors" ? p.scale : null,
    price_minor: Math.round(p.price * 100),
    discount_percent: p.discount,
    stock: p.stock,
    age_min: p.ageMin,
    safety_notes: p.safetyNotes,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    occasions: p.occasions,
    is_featured: p.isFeatured,
    is_limited: p.isLimited,
    is_new: p.isNew,
    is_published: p.isPublished,
  };
}
