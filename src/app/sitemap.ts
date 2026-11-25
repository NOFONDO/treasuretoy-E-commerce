import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProducts } from "@/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/shop/kids", "/shop/collectors", "/gifts", "/gifts/birthday", "/gifts/christmas", "/gifts/premium", "/gift-finder", "/about", "/contact"];
  const products = await getProducts();
  return [
    ...staticPaths.map((path) => ({ url: `${siteConfig.url}${path}`, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ url: `${siteConfig.url}/products/${p.slug}`, changeFrequency: "weekly" as const })),
  ];
}
