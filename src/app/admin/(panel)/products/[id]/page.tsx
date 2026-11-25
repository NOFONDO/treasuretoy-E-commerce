import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/MediaManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProduct } from "@/services/admin-queries";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { supabase } = await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const data = await getAdminProduct(supabase, id);
  if (!data) notFound();

  const { product, images, videos } = data;
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/products" className="text-sm text-charcoal/65 hover:text-navy">← All products</Link>
        <h1 className="mt-2 text-3xl">{product.name}</h1>
        {created && <p role="status" className="mt-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Product created. Add photos and videos below, then tick “Published” when it is ready.</p>}
      </div>
      <MediaManager productId={product.id} productName={product.name} images={images} videos={videos} />
      <ProductForm product={product} />
    </div>
  );
}
