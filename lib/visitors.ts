import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getVisitorHashSecret, VISITOR_COOKIE_NAME } from "@/lib/env";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function createVisitorId() {
  return randomUUID();
}

export function hashVisitorId(visitorId: string) {
  // Store only a salted hash in the likes table, never the raw visitor cookie.
  return createHash("sha256")
    .update(`${visitorId}:${getVisitorHashSecret()}`)
    .digest("hex");
}

export async function getExistingVisitorHash() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

  if (!visitorId) {
    return null;
  }

  return hashVisitorId(visitorId);
}

export async function getOrCreateVisitorHash() {
  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
  const visitorId = existingVisitorId || createVisitorId();

  if (!existingVisitorId) {
    // A one-year cookie keeps like spam protection stable without requiring login.
    cookieStore.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  return hashVisitorId(visitorId);
}
