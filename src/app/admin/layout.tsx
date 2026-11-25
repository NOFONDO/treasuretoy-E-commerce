import type { Metadata } from "next";
import type { ReactNode } from "react";

// Admin pages depend on the signed-in user, so they must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-mist">{children}</div>;
}
