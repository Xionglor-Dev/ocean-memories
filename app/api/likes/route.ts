import { NextResponse } from "next/server";
import { hasSupabaseServiceEnv } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getOrCreateVisitorHash } from "@/lib/visitors";

export const runtime = "nodejs";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!hasSupabaseServiceEnv()) {
    return NextResponse.json(
      { error: "Supabase service role is not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    memoryId?: string;
    mode?: "like" | "unlike" | "toggle";
  } | null;

  if (!body?.memoryId || !uuidPattern.test(body.memoryId)) {
    return NextResponse.json({ error: "Invalid memory id" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  // The visitor hash is device-scoped, so one browser cannot spam likes forever.
  const visitorHash = await getOrCreateVisitorHash();

  // Visitors can only like memories that are already public.
  const { data: memory, error: memoryError } = await supabase
    .from("memories")
    .select("id")
    .eq("id", body.memoryId)
    .eq("is_published", true)
    .maybeSingle();

  if (memoryError || !memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("memory_id", body.memoryId)
    .eq("visitor_hash", visitorHash)
    .maybeSingle();

  let liked = Boolean(existingLike);

  // Unique database constraints backstop this logic against duplicate likes.
  if (existingLike && body.mode !== "like") {
    await supabase.from("likes").delete().eq("id", existingLike.id);
    liked = false;
  } else if (!existingLike && body.mode !== "unlike") {
    const { error } = await supabase.from("likes").insert({
      memory_id: body.memoryId,
      visitor_hash: visitorHash,
    });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: "Unable to like memory" }, { status: 500 });
    }

    liked = true;
  }

  const { data: updatedMemory } = await supabase
    .from("memories")
    .select("likes_count")
    .eq("id", body.memoryId)
    .single();

  return NextResponse.json({
    liked,
    likesCount: updatedMemory?.likes_count ?? 0,
  });
}
