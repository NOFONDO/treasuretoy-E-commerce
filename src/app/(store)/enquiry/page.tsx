import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";

export const metadata: Metadata = { title: "Order on WhatsApp", robots: { index: false } };

export default function EnquiryPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-4xl">Send us your order</h1>
        <p className="mt-3 text-charcoal/75">Tell us where to deliver and we will open WhatsApp with your list ready to send.</p>
      </header>
      <EnquiryForm />
    </div>
  );
}
