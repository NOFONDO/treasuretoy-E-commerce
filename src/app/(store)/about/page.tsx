import type { Metadata } from "next";

export const metadata: Metadata = { title: "About us", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
      <h1 className="text-4xl">About TREASURE_TOYSHOP</h1>
      <p className="leading-relaxed text-charcoal/85">
        We sell quality toy cars for children and detailed diecast models for collectors. We keep things personal: you
        choose your cars, message us, and we agree the price, delivery and payment together.
      </p>
      <p className="leading-relaxed text-charcoal/85">
        Children's toys and adult collectibles are kept apart on purpose, so every gift suits the person receiving it.
      </p>
    </div>
  );
}
