import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { signOut } from "@/app/admin/actions";
import { siteConfig } from "@/config/site";
import { getSessionClient } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await getSessionClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && error !== "forbidden") {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "admin") redirect("/admin");
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-navy/10">
        <div>
          <p className="font-display text-xl text-gold-deep">{siteConfig.name}</p>
          <h1 className="mt-1 text-3xl">Admin sign in</h1>
        </div>

        {!supabase ? (
          <p className="text-sm text-charcoal/75">Supabase is not configured yet. Add the keys to <code>.env.local</code> (see README), then reload.</p>
        ) : error === "forbidden" ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-700">This account is not an administrator.</p>
            <form action={signOut}><button className="rounded-full bg-navy px-5 py-2 text-sm text-white">Sign out</button></form>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
