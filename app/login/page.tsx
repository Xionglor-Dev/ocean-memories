import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";
import { OceanBackground } from "@/components/ocean/ocean-background";
import { PageTransition } from "@/components/shared/page-transition";
import { getCurrentAdmin } from "@/lib/auth";
import { hasSupabaseEnv, hasSupabaseServiceEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Logged-in admins should go straight to the dashboard instead of seeing login again.
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const isConfigured = hasSupabaseEnv() && hasSupabaseServiceEnv();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <OceanBackground />
      <PageTransition>
        {isConfigured ? (
          <Suspense>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="mx-auto max-w-xl rounded-[8px] bg-white/92 p-6 shadow-memory ring-1 ring-white/80 backdrop-blur-sm sm:p-9">
            <p className="font-handwriting text-4xl font-semibold text-ocean-deep sm:text-5xl">
              Setup Needed
            </p>
            <h1 className="mt-3 text-4xl font-bold text-ocean-text">
              Supabase environment variables are missing.
            </h1>
            <p className="mt-5 text-lg leading-8 text-ocean-text/75">
              Add the values from `.env.example`, run the migration, and create
              the admin account before logging in.
            </p>
          </div>
        )}
      </PageTransition>
    </main>
  );
}
