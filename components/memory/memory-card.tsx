"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { HeartBurst } from "@/components/memory/heart-burst";
import { LikeButton } from "@/components/memory/like-button";
import { MemoryNoteSticker } from "@/components/memory/memory-note-sticker";
import { PhotoStack } from "@/components/memory/photo-stack";
import { useMemoryLike } from "@/components/memory/use-memory-like";
import { formatMemoryDate } from "@/lib/utils";
import type { MemoryWithImages } from "@/lib/types";

type MemoryCardProps = {
  memory: MemoryWithImages;
};

export function MemoryCard({ memory }: MemoryCardProps) {
  const title = memory.title || "Ocean memory";
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement | null>(null);
  // Each card gently rises as it enters the viewport, like a memory surfacing.
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 96%", "start 58%"],
  });
  const smoothReveal = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.55,
  });
  const revealY = useTransform(
    smoothReveal,
    [0, 1],
    [shouldReduceMotion ? 0 : 84, 0],
  );
  const revealOpacity = useTransform(
    smoothReveal,
    [0, 0.32, 1],
    [shouldReduceMotion ? 1 : 0, shouldReduceMotion ? 1 : 0.55, 1],
  );
  const revealScale = useTransform(
    smoothReveal,
    [0, 1],
    [shouldReduceMotion ? 1 : 0.985, 1],
  );
  const { liked, count, isPending, toggleLike } = useMemoryLike(
    memory.id,
    memory.has_liked,
    memory.likes_count,
  );
  const [burstKey, setBurstKey] = useStateLikeBurst();

  const likeFromPhoto = () => {
    // Mobile double-tap likes should feel instant, even before the API returns.
    setBurstKey();
    toggleLike({ forceLike: true });
  };

  return (
    <motion.article
      ref={cardRef}
      className="relative transform-gpu rounded-[8px] bg-white/92 p-3 shadow-memory ring-1 ring-white/80 backdrop-blur-sm transition-shadow duration-300 will-change-transform hover:shadow-[0_24px_70px_rgba(31,110,145,0.2)] sm:p-7"
      style={{
        opacity: revealOpacity,
        y: revealY,
        scale: revealScale,
      }}
    >
      <HeartBurst burstKey={burstKey} />
      <MemoryNoteSticker
        memoryId={memory.id}
        shouldReduceMotion={shouldReduceMotion}
      />

      <header className="mb-5 border-b border-ocean-background pb-5 pr-28 sm:pr-36">
        <time
          dateTime={memory.date}
          className="calligraffitti-text block text-3xl text-ocean-deep"
        >
          {formatMemoryDate(memory.date)}
        </time>
        {memory.title ? (
          <h2 className="kaushan-quote mt-3 text-3xl leading-tight text-ocean-text sm:text-4xl">
            {memory.title}
          </h2>
        ) : null}
      </header>

      <div className="relative">
        <PhotoStack
          images={memory.memory_images}
          title={title}
          date={memory.date}
          large
          onDoubleTap={likeFromPhoto}
        />
      </div>

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
    </motion.article>
  );
}

function useStateLikeBurst() {
  const [burstKey, setBurstKeyState] = useState(0);

  return [
    burstKey,
    () => setBurstKeyState((current) => current + 1),
  ] as const;
}
