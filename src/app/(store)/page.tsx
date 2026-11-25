import Link from "next/link";
import { Hero } from "@/components/homepage/Hero";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/services/products";

export const revalidate = 60;

const departments = [
  { href: "/shop/kids", title: "Kids' Collection", text: "Remote-control cars, ride-ons, tracks and gift sets chosen for play, with honest age guidance.", tone: "bg-navy text-white" },
  { href: "/shop/collectors", title: "Collectors' Collection", text: "Diecast supercars, classics and limited editions from 1:18 to 1:64. Adult display models.", tone: "bg-gold text-navy" },
];

const occasions = [
  { href: "/gifts/birthday", title: "Birthday gifts" },
  { href: "/gifts/christmas", title: "Christmas collection" },
  { href: "/gifts/premium", title: "Premium gifts" },
];

const steps = [
  { title: "Choose your cars", text: "Browse and add anything you like to your cart." },
  { title: "Send us your cart", text: "One tap opens WhatsApp with your list already written." },
  { title: "Agree the details", text: "We confirm the price, delivery to your country and a payment method that suits you." },
];

export default async function HomePage() {
  const products = await getProducts();
  const kids = products.filter((p) => p.department === "kids" && p.isFeatured).slice(0, 4);
  const collectors = products.filter((p) => p.department === "collectors" && p.isFeatured).slice(0, 4);
  const arrivals = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-7xl space-y-24 px-4 pt-20 sm:px-6">
        <section aria-labelledby="departments" className="grid gap-6 md:grid-cols-2">
          <h2 id="departments" className="sr-only">Shop by department</h2>
          {departments.map((d) => (
            <Link key={d.href} href={d.href} className={`group rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-10 ${d.tone}`}>
              <h3 className="font-display text-3xl !text-current">{d.title}</h3>
              <p className="mt-3 max-w-sm opacity-85">{d.text}</p>
              <span className="mt-6 inline-block text-sm font-medium underline-offset-4 group-hover:underline">Shop now</span>
            </Link>
          ))}
        </section>

        <section>
          <SectionHeading title="Children's best sellers" href="/shop/kids" />
          <ProductGrid products={kids} />
        </section>

        <section>
          <SectionHeading title="Premium collector collection" description="Detailed, display-ready models for adult collectors." href="/shop/collectors" />
          <ProductGrid products={collectors} />
        </section>

        <section aria-labelledby="gifts">
          <SectionHeading title="The gift centre" description="Birthdays, Christmas and special occasions, sorted by who it is for." href="/gift-finder" linkLabel="Use the gift finder" />
          <h2 id="gifts" className="sr-only">Gift centre</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {occasions.map((o) => (
              <Link key={o.href} href={o.href} className="rounded-2xl bg-white p-6 font-display text-xl text-navy ring-1 ring-navy/10 transition-shadow hover:shadow-lg">
                {o.title}
              </Link>
            ))}
          </div>
        </section>

        {arrivals.length > 0 && (
          <section>
            <SectionHeading title="New arrivals" />
            <ProductGrid products={arrivals} />
          </section>
        )}

        <section className="rounded-3xl bg-mist p-8 sm:p-12">
          <h2 className="text-3xl">How ordering works</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-4xl text-gold-deep">{i + 1}</span>
                <h3 className="mt-2 text-xl">{s.title}</h3>
                <p className="mt-1 text-charcoal/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
