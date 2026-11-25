import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { listEnquiries } from "@/services/admin-queries";

const LOW_STOCK = 3;

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const count = async (build: (q: ReturnType<typeof supabase.from>) => PromiseLike<{ count: number | null }>) =>
    (await build(supabase.from("products")))?.count ?? 0;

  const [total, published, lowStock, newEnquiries, recent] = await Promise.all([
    count((q) => q.select("id", { count: "exact", head: true })),
    count((q) => q.select("id", { count: "exact", head: true }).eq("is_published", true)),
    count((q) => q.select("id", { count: "exact", head: true }).lte("stock", LOW_STOCK)),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new").then((r) => r.count ?? 0),
    listEnquiries(supabase, 5),
  ]);

  const stats = [
    { label: "Products", value: total, href: "/admin/products" },
    { label: "Published", value: published, href: "/admin/products" },
    { label: `Low stock (≤${LOW_STOCK})`, value: lowStock, href: "/admin/products" },
    { label: "New enquiries", value: newEnquiries, href: "/admin/enquiries" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-white p-5 ring-1 ring-navy/10 transition-shadow hover:shadow-lg">
            <p className="text-sm text-charcoal/70">{s.label}</p>
            <p className="mt-1 font-display text-4xl text-navy">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-navy/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Recent enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm text-gold-deep hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-charcoal/65">No enquiries yet. They appear here when customers send a cart from the site.</p>
        ) : (
          <ul className="divide-y divide-navy/10 text-sm">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                <span><strong>{e.reference}</strong> · {e.customer_name} · {e.country}</span>
                <Badge tone={e.status === "new" ? "amber" : "grey"}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
