import { hasSupabaseEnv, hasSupabaseServiceEnv } from "@/lib/env";
import { getExistingVisitorHash } from "@/lib/visitors";
import {
  createSupabasePublicClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import type { Memory, MemoryImage, MemoryWithImages } from "@/lib/types";

type PublishedMemoryUrl = Pick<Memory, "id" | "updated_at">;

function sortImages(images: MemoryImage[] = []) {
  return [...images].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.created_at.localeCompare(b.created_at);
  });
}

function normalizeMemory(memory: MemoryWithImages): MemoryWithImages {
  return {
    ...memory,
    memory_images: sortImages(memory.memory_images),
  };
}

async function withLikeState(memories: MemoryWithImages[]) {
  const visitorHash = await getExistingVisitorHash();

  if (!visitorHash || !hasSupabaseServiceEnv() || memories.length === 0) {
    return memories.map((memory) => ({ ...memory, has_liked: false }));
  }

  const serviceSupabase = createSupabaseServiceClient();
  const { data } = await serviceSupabase
    .from("likes")
    .select("memory_id")
    .eq("visitor_hash", visitorHash)
    .in(
      "memory_id",
      memories.map((memory) => memory.id),
    );

  const likedIds = new Set((data || []).map((like) => like.memory_id));

  return memories.map((memory) => ({
    ...memory,
    has_liked: likedIds.has(memory.id),
  }));
}

export async function getPublishedMemories() {
  if (!hasSupabaseEnv()) {
    return [];
  }

  // Public reads avoid auth cookies so stale admin sessions cannot break visitors.
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*, memory_images(*)")
    .eq("is_published", true)
    .order("date", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Unable to load published memories", error);
    return [];
  }

  const memories = data.map((memory) =>
    normalizeMemory(memory as MemoryWithImages),
  );

  return withLikeState(memories);
}

export async function getPublishedMemory(id: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*, memory_images(*)")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const [memory] = await withLikeState([
    normalizeMemory(data as MemoryWithImages),
  ]);

  return memory || null;
}

export async function getAdminMemories() {
  if (!hasSupabaseServiceEnv()) {
    return [];
  }

  // Admin data uses the service client after route-level admin protection.
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*, memory_images(*)")
    .order("date", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Unable to load admin memories", error);
    return [];
  }

  return data.map((memory) => normalizeMemory(memory as MemoryWithImages));
}

export async function getPublishedMemoryUrls(): Promise<PublishedMemoryUrl[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("memories")
    .select("id, updated_at")
    .eq("is_published", true)
    .order("date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as PublishedMemoryUrl[];
}
