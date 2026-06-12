export const MEMORY_IMAGES_BUCKET = "memory-images";
export const VISITOR_COOKIE_NAME = "ocean_visitor_id";

export function getSiteUrl() {
  // Metadata, sitemap, and share links need one canonical public URL.
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseServiceEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return value;
}

export function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return value;
}

export function getVisitorHashSecret() {
  // Local development still works, while production can use a stronger secret.
  return (
    process.env.VISITOR_HASH_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "local-ocean-memories-secret"
  );
}
