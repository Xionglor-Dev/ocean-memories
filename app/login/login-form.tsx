"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Lock, LogIn, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setLoginStatus("Checking your login...");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoginStatus("");
        setIsSubmitting(false);
        return;
      }

      setLoginStatus("Confirming admin access...");

      // Email/password can be valid, but only rows in admin_users may enter /admin.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Login did not finish. Please try again.");
        setLoginStatus("");
        setIsSubmitting(false);
        return;
      }

      const { data: adminUser, error: adminCheckError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminCheckError || !adminUser) {
        await supabase.auth.signOut();
        setError(
          "This account is not registered as the admin. Add this Auth user ID to public.admin_users in Supabase.",
        );
        setLoginStatus("");
        setIsSubmitting(false);
        return;
      }

      setLoginStatus("Login complete. Opening dashboard...");
      router.replace(searchParams.get("redirectedFrom") || "/admin");
      router.refresh();
    } catch {
      setError("Login could not finish. Please try again.");
      setLoginStatus("");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-xl rounded-[8px] bg-white/92 p-6 shadow-memory ring-1 ring-white/80 backdrop-blur-sm sm:p-9"
    >
      <div>
        <p className="calligraffitti-text text-4xl text-ocean-deep sm:text-5xl">
          My Ocean Memories
        </p>
        <h1 className="mt-3 text-4xl font-bold text-ocean-text">Owner Login</h1>
      </div>

      <label className="mt-10 block">
        <span className="text-base font-semibold text-ocean-text">Email</span>
        <span className="mt-3 flex items-center gap-4 rounded-full border-2 border-ocean-timeline/65 bg-white/88 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(124,203,255,0.16)] transition focus-within:border-ocean-deep/70 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]">
          <Mail className="h-6 w-6 text-ocean-deep" aria-hidden="true" />
          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="login-pill-input w-full rounded-full bg-transparent px-1 text-lg font-semibold text-ocean-text outline-none placeholder:text-ocean-text/42"
          />
        </span>
      </label>

      <label className="mt-6 block">
        <span className="text-base font-semibold text-ocean-text">Password</span>
        <span className="mt-3 flex items-center gap-4 rounded-full border-2 border-ocean-timeline/65 bg-white/88 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(124,203,255,0.16)] transition focus-within:border-ocean-deep/70 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]">
          <Lock className="h-6 w-6 text-ocean-deep" aria-hidden="true" />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="login-pill-input w-full rounded-full bg-transparent px-1 text-lg font-semibold text-ocean-text outline-none placeholder:text-ocean-text/42"
          />
        </span>
      </label>

      {error ? (
        <p className="mt-5 rounded-[8px] bg-ocean-heart/10 px-4 py-3 text-sm font-medium text-ocean-heart">
          {error}
        </p>
      ) : null}

      {loginStatus ? (
        <p
          className="mt-5 rounded-[8px] bg-ocean-background/85 px-4 py-3 text-center text-sm font-bold text-ocean-deep shadow-soft"
          aria-live="polite"
        >
          {loginStatus}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold text-white shadow-soft transition hover:text-ocean-deep disabled:cursor-wait ${
          isSubmitting
            ? "animate-pulse bg-ocean-deep ring-4 ring-ocean-timeline/35"
            : "bg-ocean-heart hover:bg-[#eb4c79]"
        }`}
      >
        {isSubmitting ? (
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="h-5 w-5" aria-hidden="true" />
        )}
        {isSubmitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
