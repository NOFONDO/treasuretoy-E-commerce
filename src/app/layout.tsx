import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} | Premium Toy Cars & Collectibles`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
