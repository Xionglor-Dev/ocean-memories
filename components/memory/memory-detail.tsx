"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HeartBurst } from "@/components/memory/heart-burst";
import { LikeButton } from "@/components/memory/like-button";
import { PhotoStack } from "@/components/memory/photo-stack";
import { useMemoryLike } from "@/components/memory/use-memory-like";
import { formatMemoryDate } from "@/lib/utils";
import type { MemoryWithImages } from "@/lib/types";

export function MemoryDetail({ memory }: { memory: MemoryWithImages }) {
  const title = memory.title || "Ocean memory";
  const [burstKey, setBurstKey] = useState(0);
  const { liked, count, isPending, toggleLike } = useMemoryLike(
    memory.id,
    memory.has_liked,
    memory.likes_count,
  );

  const likeFromPhoto = () => {
    // Detail photos can trigger the same Instagram-style heart burst as timeline cards.
    setBurstKey((current) => current + 1);
    toggleLike({ forceLike: true });
  };

  return (
    <motion.article
      className="relative z-10 mx-auto max-w-[900px] px-2 py-8 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <HeartBurst burstKey={burstKey} />

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 font-semibold text-ocean-text shadow-soft transition hover:text-ocean-heart"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Timeline
      </Link>

      <div className="rounded-[8px] bg-white/92 p-4 shadow-memory ring-1 ring-white/80 backdrop-blur-sm sm:p-7">
        <header className="mb-5 border-b border-ocean-background pb-5">
          <div>
            <time
              dateTime={memory.date}
              className="calligraffitti-text block text-3xl text-ocean-deep"
            >
              {formatMemoryDate(memory.date)}
            </time>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-ocean-text sm:text-5xl">
              {title}
            </h1>
          </div>
        </header>

        <PhotoStack
          images={memory.memory_images}
          title={title}
          date={memory.date}
          large
          onDoubleTap={likeFromPhoto}
        />

        <div className="story-copy calligraffitti-text mt-6 text-[1.35rem] leading-[2.25rem] text-ocean-text/90 sm:text-[1.45rem] sm:leading-[2.45rem]">
          {memory.content}
        </div>

        <footer className="mt-4 flex items-center justify-start border-t border-ocean-background pt-3 sm:mt-7 sm:pt-5">
          <LikeButton
            liked={liked}
            count={count}
            pending={isPending}
            layout="detail"
            onToggle={() => toggleLike()}
          />
        </footer>
      </div>
    </motion.article>
  );
}
