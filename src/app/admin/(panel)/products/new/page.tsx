import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl">Add product</h1>
      <p className="text-sm text-charcoal/70">Fill in the details and create the product. You can add photos and videos on the next screen.</p>
      <ProductForm />
    </div>
  );
}
