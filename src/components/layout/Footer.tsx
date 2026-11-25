import Link from "next/link";
import { nav, siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

export function Footer() {
  const wa = whatsappUrl();
  return (
    <footer className="mt-24 bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-gold">{siteConfig.name}</p>
          <p className="mt-3 max-w-xs text-sm">{siteConfig.tagline}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          {[...nav, { href: "/about", label: "About us" }, { href: "/contact", label: "Contact" }].map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gold">{item.label}</Link>
          ))}
        </nav>
        <div className="space-y-2 text-sm">
          <p className="text-white">Order and enquiries</p>
          {wa && <a href={wa} className="block hover:text-gold" target="_blank" rel="noopener noreferrer">WhatsApp: +{siteConfig.whatsappNumber}</a>}
          {siteConfig.contactEmail && <a href={`mailto:${siteConfig.contactEmail}`} className="block hover:text-gold">{siteConfig.contactEmail}</a>}
          <p className="pt-2 text-xs text-white/60">Prices are indicative. Final price, delivery and payment are agreed with you directly.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
