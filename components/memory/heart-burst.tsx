"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function HeartBurst({ burstKey }: { burstKey: number }) {
  // A changing key restarts the burst animation for each mobile double-tap.
  if (!burstKey) {
    return null;
  }

  return (
    <motion.div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.35, 1.85] }}
      transition={{ duration: 0.72, ease: "easeOut" }}
    >
      <Heart className="h-24 w-24 fill-ocean-heart text-ocean-heart drop-shadow-[0_10px_28px_rgba(255,92,138,0.45)]" />
    </motion.div>
  );
}
