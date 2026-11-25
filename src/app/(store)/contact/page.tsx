import type { Metadata } from "next";
import { MessageCircle, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

const faqs = [
  { q: "Can I pay on the website?", a: "No. You send us your order on WhatsApp and we agree the payment method with you directly." },
  { q: "How is delivery priced?", a: "Delivery depends on your country and the items. We confirm the cost before you pay anything." },
  { q: "Are collectibles suitable for children?", a: "No. Collector models are display pieces for adults and older teenagers, and are labelled accordingly." },
];

export default function ContactPage() {
  const wa = whatsappUrl("Hello TREASURE_TOYSHOP, I would like to make an enquiry about your products.");
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6">
      <h1 className="text-4xl">Contact us</h1>
      <div className="flex flex-wrap gap-3">
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-navy"><MessageCircle className="size-5" aria-hidden /> WhatsApp +{siteConfig.whatsappNumber}</a>}
        {siteConfig.contactEmail && <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium ring-1 ring-navy/30"><Mail className="size-5" aria-hidden /> {siteConfig.contactEmail}</a>}
      </div>
      <section aria-labelledby="faq">
        <h2 id="faq" className="mb-4 text-2xl">Questions</h2>
        <dl className="space-y-5">
          {faqs.map((f) => (
            <div key={f.q}><dt className="font-medium text-navy">{f.q}</dt><dd className="mt-1 text-charcoal/80">{f.a}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}
