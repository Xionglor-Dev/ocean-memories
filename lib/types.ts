import type { Database } from "@/types/database";

export type Memory = Database["public"]["Tables"]["memories"]["Row"];
export type MemoryImage = Database["public"]["Tables"]["memory_images"]["Row"];
export type MemoryWithImages = Memory & {
  memory_images: MemoryImage[];
  has_liked?: boolean;
};

export type ActionState = {
  ok: boolean;
  message: string;
  memoryId?: string;
};
