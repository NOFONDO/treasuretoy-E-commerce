import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import { DeleteProductButton, PublishToggle } from "@/components/admin/RowActions";
import { ProductImage } from "@/components/products/ProductImage";
import { requireAdmin } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/money";
import { listAdminProducts } from "@/services/admin-queries";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const products = await listAdminProducts(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-navy">Add product</Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-charcoal/70 ring-1 ring-navy/10">No products yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy/10 text-charcoal/65">
              <tr><th className="p-3">Product</th><th className="p-3">Department</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 shrink-0 overflow-hidden rounded-md"><ProductImage image={p.images[0]} sizes="56px" /></div>
                      <div><p className="font-medium text-navy">{p.name}</p><p className="text-xs text-charcoal/60">{p.sku}</p></div>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{p.department}</td>
                  <td className="p-3">{formatMoney(p.priceMinor)}</td>
                  <td className="p-3">{p.stock <= 3 ? <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock}</Badge> : p.stock}</td>
                  <td className="p-3"><Badge tone={p.isPublished ? "green" : "grey"}>{p.isPublished ? "Published" : "Draft"}</Badge></td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/admin/products/${p.id}`} className="text-sm text-navy underline-offset-2 hover:underline">Edit</Link>
                      <PublishToggle productId={p.id} published={p.isPublished} />
                      <DeleteProductButton productId={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
