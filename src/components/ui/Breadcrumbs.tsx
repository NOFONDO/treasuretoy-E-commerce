import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteConfig } from "@/config/site";

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-charcoal/70">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-navy">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-navy hover:underline">{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `${siteConfig.url}${item.href}`,
          })),
        }}
      />
    </nav>
  );
}
