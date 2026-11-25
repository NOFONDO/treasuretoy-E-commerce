import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Providers } from "@/components/Providers";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteConfig } from "@/config/site";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
          ],
        }}
      />
    </Providers>
  );
}
