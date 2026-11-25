import type { Metadata } from "next";
import { EnquiryStatusSelect } from "@/components/admin/RowActions";
import { requireAdmin } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/money";
import { listEnquiries } from "@/services/admin-queries";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const { supabase } = await requireAdmin();
  const enquiries = await listEnquiries(supabase);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl">Enquiries</h1>
      {enquiries.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-charcoal/70 ring-1 ring-navy/10">No enquiries yet.</p>}

      <ul className="space-y-4">
        {enquiries.map((e) => {
          const digits = e.customer_phone?.replace(/\D/g, "") ?? "";
          const total = e.enquiry_items.reduce((n, i) => n + i.unit_price_minor * i.quantity, 0);
          return (
            <li key={e.id} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-navy/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy">{e.reference} · {e.customer_name}</p>
                  <p className="text-sm text-charcoal/70">{e.country} · {new Date(e.created_at).toLocaleString("en-GB")}</p>
                  <p className="text-sm text-charcoal/70">{[e.customer_phone, e.customer_email].filter(Boolean).join(" · ")}</p>
                </div>
                <EnquiryStatusSelect enquiryId={e.id} status={e.status} />
              </div>
              <ul className="divide-y divide-navy/10 text-sm">
                {e.enquiry_items.map((i) => (
                  <li key={i.sku} className="flex justify-between py-1.5"><span>{i.product_name} × {i.quantity}</span><span>{formatMoney(i.unit_price_minor * i.quantity)}</span></li>
                ))}
              </ul>
              <p className="text-sm font-medium">Estimated total {formatMoney(total)}</p>
              {e.notes && <p className="rounded-lg bg-mist p-3 text-sm">{e.notes}</p>}
              {digits.length >= 8 && (
                <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-gold-deep underline">Reply on WhatsApp</a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
