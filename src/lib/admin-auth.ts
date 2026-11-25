import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getSessionClient } from "@/lib/supabase/server";

export interface AdminContext {
  supabase: SupabaseClient;
  user: User;
}

/**
 * The single gate for admin pages AND server actions. Server actions are public
 * HTTP endpoints, so every one must call this rather than rely on the layout.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await getSessionClient();
  if (!supabase) throw new Error("Supabase is not configured. See README.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { supabase, user };
}
