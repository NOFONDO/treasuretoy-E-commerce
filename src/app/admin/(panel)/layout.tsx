import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { siteConfig } from "@/config/site";
import { getSessionClient } from "@/lib/supabase/server";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!(await getSessionClient())) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <p className="max-w-md rounded-2xl bg-white p-8 text-charcoal/80">
          The admin needs Supabase. Add your project keys to <code>.env.local</code> and run the migrations (see README), then reload.
        </p>
      </div>
    );
  }
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="bg-navy p-5 text-white md:w-60 md:shrink-0">
        <p className="font-display text-lg text-gold">{siteConfig.name}</p>
        <nav aria-label="Admin" className="mt-4 flex gap-1 md:flex-col">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-gold">{l.label}</Link>
          ))}
          <Link href="/" target="_blank" className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-gold">View site</Link>
        </nav>
        <form action={signOut} className="mt-6">
          <button className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-gold">Sign out</button>
        </form>
      </aside>
      <div className="flex-1 p-6 sm:p-8">{children}</div>
    </div>
  );
}
