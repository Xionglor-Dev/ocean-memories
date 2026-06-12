"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  liked: boolean;
  count: number;
  pending?: boolean;
  layout?: "timeline" | "detail";
  onToggle: () => void;
};

export function LikeButton({
  liked,
  count,
  pending,
  layout = "timeline",
  onToggle,
}: LikeButtonProps) {
  return (
    // Touch manipulation keeps phone taps responsive and avoids accidental zoom delays.
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      aria-busy={pending || undefined}
      aria-label={liked ? "Unlike this memory" : "Like this memory"}
      className={cn(
        "group inline-flex touch-manipulation items-center gap-2 rounded-full text-ocean-text transition hover:text-ocean-heart",
        "max-sm:flex-col max-sm:gap-0.5",
        layout === "detail"
          ? "bg-white/90 px-5 py-3 text-lg shadow-soft max-sm:min-h-[58px] max-sm:min-w-[64px] max-sm:px-3 max-sm:py-2 max-sm:text-base"
          : "px-2 py-1 text-base",
      )}
      whileTap={{ scale: 0.94 }}
    >
      <motion.span
        aria-hidden="true"
        animate={
          liked
            ? { scale: [1, 1.24, 1], rotate: [0, -8, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="grid place-items-center"
      >
        <Heart
          className={cn(
            "h-6 w-6 transition-colors duration-150 max-sm:h-5 max-sm:w-5",
            liked
              ? "fill-ocean-heart text-ocean-heart"
              : "text-ocean-heart group-hover:fill-ocean-heart/20",
          )}
        />
      </motion.span>
      <span className="font-semibold tabular-nums max-sm:text-base">{count}</span>
    </motion.button>
  );
}
