import { redirect } from "next/navigation";
import { hasSupabaseEnv, hasSupabaseServiceEnv } from "@/lib/env";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  if (!hasSupabaseEnv() || !hasSupabaseServiceEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({
    // Expired refresh-token cookies should behave like a logged-out session.
    data: { user: null },
  }));

  if (!user) {
    return null;
  }

  const serviceSupabase = createSupabaseServiceClient();
  const { data: admin } = await serviceSupabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return admin ? user : null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}
