import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemoryDetail } from "@/components/memory/memory-detail";
import { OceanBackground } from "@/components/ocean/ocean-background";
import { getPublishedMemory } from "@/lib/data/memories";
import { formatMemoryDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MemoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: MemoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const memory = await getPublishedMemory(id);

  if (!memory) {
    // Private drafts and missing IDs should both behave like a not-found page.
    return {
      title: "Memory not found",
    };
  }

  const title = memory.title || `Memory from ${formatMemoryDate(memory.date)}`;

  return {
    title,
    description: "A private ocean memory from My Ocean Memories.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: "My Ocean Memories",
      description: "A private ocean memory.",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "My Ocean Memories",
      description: "A private ocean memory.",
    },
  };
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const { id } = await params;
  const memory = await getPublishedMemory(id);

  if (!memory) {
    // Visitors can only open published memories.
    notFound();
  }

  return (
    <main className="relative min-h-screen">
      <OceanBackground />
      <MemoryDetail memory={memory} />
    </main>
  );
}
