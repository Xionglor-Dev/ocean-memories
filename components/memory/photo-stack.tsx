"use client";

import Image from "next/image";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatMemoryDate } from "@/lib/utils";
import type { MemoryImage } from "@/lib/types";

type PhotoStackProps = {
  images: MemoryImage[];
  title: string;
  date: string;
  onDoubleTap?: () => void;
  large?: boolean;
};

// Deterministic particles keep the hover effect lively without random re-renders.
const hoverParticles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: 8 + ((index * 17) % 84),
  y: 18 + ((index * 29) % 66),
  drift: -34 + ((index * 23) % 68),
  size: 3 + (index % 5),
  delay: (index * 0.16) % 1.8,
  duration: 2.8 + (index % 6) * 0.34,
  kind: index % 5 === 0 ? "bubble" : index % 3 === 0 ? "spark" : "particle",
}));

const frontSlotOffset = 0;
const frontLayerZIndex = 100;
const nearLayerZIndex = 42;
const farLayerZIndex = 24;
const autoRotationDelay = 6400;
const autoRotationResumeDelay = 7200;
const autoRotationAnimationResetDelay = 2200;
const manualSlideAnimationResetDelay = 1120;

type StackLayer = {
  image: MemoryImage;
  imageIndex: number;
  offset: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
  zIndex: number;
  depth: number;
};

type ImageSlot = {
  offset: number;
  imageIndex: number;
};

type StackMetrics = {
  cardWidth: number;
  nearOffset: number;
  farOffset: number;
  minHeight: number;
};

export function PhotoStack({
  images,
  title,
  date,
  onDoubleTap,
  large,
}: PhotoStackProps) {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
    createInitialImageSlots(images.length),
  );
  const [autoRotationPaused, setAutoRotationPaused] = useState(false);
  const [autoRotationAnimating, setAutoRotationAnimating] = useState(false);
  const [manualSlideAnimating, setManualSlideAnimating] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const autoAnimationTimerRef = useRef<number | null>(null);
  const manualAnimationTimerRef = useRef<number | null>(null);
  const stackWidth = useElementWidth(stackRef);
  const isCompactDeck = stackWidth > 0 && stackWidth < 520;
  const isSmallDeck = images.length > 1 && images.length <= 3;
  // Phones render fewer behind-the-front layers so sliding stays smooth.
  const maxVisibleDepth = Math.min(
    getMaxVisibleDepth(images.length),
    isCompactDeck ? 1 : 2,
  );
  const stackMetrics = useMemo(
    () =>
      getStackMetrics(
        stackWidth,
        Boolean(large),
        maxVisibleDepth,
        images.length,
      ),
    [images.length, large, maxVisibleDepth, stackWidth],
  );

  useEffect(() => {
    setImageSlots(createInitialImageSlots(images.length));
  }, [images.length]);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const clearAutoAnimationTimer = useCallback(() => {
    if (autoAnimationTimerRef.current) {
      window.clearTimeout(autoAnimationTimerRef.current);
      autoAnimationTimerRef.current = null;
    }
  }, []);

  const clearManualAnimationTimer = useCallback(() => {
    if (manualAnimationTimerRef.current) {
      window.clearTimeout(manualAnimationTimerRef.current);
      manualAnimationTimerRef.current = null;
    }
  }, []);

  const beginManualSlideAnimation = useCallback(() => {
    clearManualAnimationTimer();
    setManualSlideAnimating(true);

    manualAnimationTimerRef.current = window.setTimeout(() => {
      setManualSlideAnimating(false);
      manualAnimationTimerRef.current = null;
    }, manualSlideAnimationResetDelay);
  }, [clearManualAnimationTimer]);

  const pauseAutoRotation = useCallback(() => {
    setAutoRotationPaused(true);
    setAutoRotationAnimating(false);
    clearResumeTimer();
    clearAutoAnimationTimer();
  }, [clearAutoAnimationTimer, clearResumeTimer]);

  const scheduleAutoRotationResume = useCallback(
    (delay = autoRotationResumeDelay) => {
      clearResumeTimer();

      if (images.length <= 1 || shouldReduceMotion) {
        return;
      }

      resumeTimerRef.current = window.setTimeout(() => {
        setAutoRotationPaused(false);
        resumeTimerRef.current = null;
      }, delay);
    },
    [clearResumeTimer, images.length, shouldReduceMotion],
  );

  const noteUserInteraction = useCallback(() => {
    pauseAutoRotation();
    scheduleAutoRotationResume();
  }, [pauseAutoRotation, scheduleAutoRotationResume]);

  const autoRotateToNextImage = useCallback(() => {
    clearAutoAnimationTimer();
    setAutoRotationAnimating(true);
    setManualSlideAnimating(false);
    setImageSlots((current) => {
      return slideSlotsByDirection(current, images.length, 1);
    });

    autoAnimationTimerRef.current = window.setTimeout(() => {
      setAutoRotationAnimating(false);
      autoAnimationTimerRef.current = null;
    }, autoRotationAnimationResetDelay);
  }, [clearAutoAnimationTimer, images.length]);

  useEffect(() => {
    if (images.length <= 1 || autoRotationPaused || shouldReduceMotion) {
      return;
    }

    const intervalId = window.setInterval(
      autoRotateToNextImage,
      autoRotationDelay,
    );

    return () => window.clearInterval(intervalId);
  }, [
    autoRotateToNextImage,
    autoRotationPaused,
    images.length,
    shouldReduceMotion,
  ]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
      clearAutoAnimationTimer();
      clearManualAnimationTimer();
    };
  }, [clearAutoAnimationTimer, clearManualAnimationTimer, clearResumeTimer]);

  const stackLayers = useMemo(
    () => getStackLayers(images, imageSlots, Boolean(large), stackMetrics),
    [imageSlots, images, large, stackMetrics],
  );
  const renderedStackLayers = useMemo(
    () => stackLayers.filter((layer) => layer.depth <= maxVisibleDepth),
    [maxVisibleDepth, stackLayers],
  );
  const isDeckAnimating = autoRotationAnimating || manualSlideAnimating;
  const useSmallTouchDeck = isCompactDeck && isSmallDeck;
  // Small mobile decks need real drag space; otherwise two-photo stacks feel stuck.
  const dragConstraints = useSmallTouchDeck
    ? {
        left: -stackMetrics.nearOffset * 0.78,
        right: stackMetrics.nearOffset * 0.78,
      }
    : { left: 0, right: 0 };
  const useSoftMobileShadow = useSmallTouchDeck && isDeckAnimating;
  const slideTransition = autoRotationAnimating
    ? {
        type: "tween" as const,
        duration: isCompactDeck ? (isSmallDeck ? 2.05 : 1.72) : 1.9,
        ease: [0.2, 0.78, 0.2, 1] as const,
      }
    : {
        type: "tween" as const,
        duration: isCompactDeck ? (isSmallDeck ? 1.04 : 0.9) : 0.76,
        ease: [0.19, 0.82, 0.22, 1] as const,
      };

  const slideToImage = (selectedImageIndex: number) => {
    if (selectedImageIndex === getActiveImageIndex(imageSlots)) {
      return;
    }

    beginManualSlideAnimation();
    setImageSlots((current) =>
      slideSlotsToImage(current, images.length, selectedImageIndex),
    );
  };

  const slideByDirection = (direction: number) => {
    if (images.length <= 1) {
      return;
    }

    beginManualSlideAnimation();
    setImageSlots((current) =>
      slideSlotsByDirection(current, images.length, direction),
    );
  };

  const handleMobileArrowClick = (direction: number) => {
    if (isDeckAnimating || images.length <= 1) {
      return;
    }

    noteUserInteraction();
    slideByDirection(direction);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Touch decks use lower thresholds so short thumb swipes still feel responsive.
    const distanceThreshold = useSmallTouchDeck ? 24 : isCompactDeck ? 34 : 60;
    const velocityThreshold = useSmallTouchDeck ? 240 : isCompactDeck ? 300 : 420;
    const shouldMoveNext =
      info.offset.x < -distanceThreshold ||
      info.velocity.x < -velocityThreshold;
    const shouldMovePrevious =
      info.offset.x > distanceThreshold ||
      info.velocity.x > velocityThreshold;

    if (shouldMoveNext) {
      slideByDirection(1);
    } else if (shouldMovePrevious) {
      slideByDirection(-1);
    }

    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
    scheduleAutoRotationResume();
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      pauseAutoRotation();
    }
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      scheduleAutoRotationResume(1800);
    }
  };

  const handlePhotoClick = (
    imageIndex: number,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();

    if (isDraggingRef.current) {
      return;
    }

    noteUserInteraction();

    if (imageIndex !== getActiveImageIndex(imageSlots) && images.length > 1) {
      slideToImage(imageIndex);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={stackRef}
        className={cn(
          "protected-memory-photo relative mx-auto grid w-full place-items-center overflow-hidden px-1 py-3 sm:overflow-visible sm:py-4",
        )}
        style={{ minHeight: stackMetrics.minHeight }}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onDoubleClick={() => {
          noteUserInteraction();
          onDoubleTap?.();
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={pauseAutoRotation}
        onBlurCapture={(event) => {
          const nextFocusedElement = event.relatedTarget;

          if (
            !(nextFocusedElement instanceof Node) ||
            !event.currentTarget.contains(nextFocusedElement)
          ) {
            scheduleAutoRotationResume(1800);
          }
        }}
      >
        {renderedStackLayers.map((layer) => {
          const isCurrent = layer.offset === frontSlotOffset;
          const isVisibleLayer = layer.depth <= 2;
          return (
            <motion.button
              type="button"
              key={layer.image.id}
              onContextMenu={(event) => event.preventDefault()}
              tabIndex={isVisibleLayer ? 0 : -1}
              aria-hidden={isVisibleLayer ? undefined : true}
              aria-label={
                isCurrent
                  ? `Current ${title} photo ${layer.imageIndex + 1}`
                  : `Bring ${title} photo ${layer.imageIndex + 1} to front`
              }
              aria-current={isCurrent ? "true" : undefined}
              onClick={(event) =>
                handlePhotoClick(layer.imageIndex, event)
              }
              onKeyDown={(event) => {
                if (images.length <= 1) {
                  return;
                }

                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  noteUserInteraction();
                  slideByDirection(-1);
                }

                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  noteUserInteraction();
                  slideByDirection(1);
                }
              }}
              className={cn(
                "memory-photo-card absolute select-none overflow-hidden rounded-[8px] bg-white p-0.5 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-timeline/45 sm:p-1",
                isCurrent && "memory-photo-card-active",
                !isVisibleLayer && "pointer-events-none",
                isCurrent
                  ? images.length > 1
                    ? useSoftMobileShadow
                      ? "cursor-grab shadow-[0_18px_44px_rgba(22,51,67,0.18),0_8px_22px_rgba(38,92,116,0.13)] active:cursor-grabbing"
                      : "cursor-grab shadow-[0_34px_86px_rgba(22,51,67,0.25),0_14px_34px_rgba(38,92,116,0.18)] active:cursor-grabbing"
                    : "cursor-default shadow-[0_34px_86px_rgba(22,51,67,0.25),0_14px_34px_rgba(38,92,116,0.18)]"
                  : useSoftMobileShadow
                    ? "cursor-pointer shadow-[0_10px_24px_rgba(38,92,116,0.12)]"
                    : "cursor-pointer shadow-[0_18px_40px_rgba(38,92,116,0.16),0_6px_18px_rgba(38,92,116,0.12)]",
              )}
              drag={isCurrent && images.length > 1 ? "x" : false}
              dragConstraints={dragConstraints}
              dragElastic={useSmallTouchDeck ? 0.02 : isCompactDeck ? 0.045 : 0.1}
              dragMomentum={false}
              onDragStart={() => {
                isDraggingRef.current = true;
                pauseAutoRotation();
              }}
              onDragEnd={handleDragEnd}
              initial={false}
              animate={{
                x: layer.x,
                y: layer.y,
                scale: layer.scale,
                opacity: layer.opacity,
                rotate: layer.rotate,
              }}
              style={{
                zIndex: layer.zIndex,
                width: stackMetrics.cardWidth,
                transformOrigin: "center bottom",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                touchAction: "pan-y",
                WebkitTapHighlightColor: "transparent",
              }}
              transformTemplate={(_, generated) =>
                generated === "none" ? "translateZ(0)" : `${generated} translateZ(0)`
              }
              whileHover={
                !isCurrent || isDeckAnimating
                  ? undefined
                  : {
                      zIndex: frontLayerZIndex,
                      y: -8,
                      scale: 1.018,
                      rotate: 0,
                    }
              }
              transition={slideTransition}
            >
              <span aria-hidden="true" className="memory-photo-aura" />
              {isCurrent && !isDeckAnimating ? (
                <PhotoHoverParticles seed={layer.imageIndex} />
              ) : null}
              <span className="protected-memory-photo-surface relative block aspect-[4/5] overflow-hidden rounded-[7px] bg-ocean-background sm:rounded-[6px]">
                <Image
                  src={layer.image.image_url}
                  alt={`${title} from ${formatMemoryDate(date)}`}
                  fill
                  sizes={large ? "(max-width: 768px) 82vw, 460px" : "(max-width: 768px) 72vw, 360px"}
                  className="object-cover"
                  draggable={false}
                  onContextMenu={(event) => event.preventDefault()}
                  onDragStart={(event) => event.preventDefault()}
                  unoptimized={layer.image.image_url.startsWith("blob:")}
                />
                <span
                  aria-hidden="true"
                  className="protected-memory-photo-guard"
                  onContextMenu={(event) => event.preventDefault()}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "memory-photo-dark-cover",
                    !isCurrent && "memory-photo-dark-cover-visible",
                  )}
                />
                <span aria-hidden="true" className="memory-photo-border-glow" />
                <span aria-hidden="true" className="memory-photo-water-sheen" />
              </span>
            </motion.button>
          );
        })}

        {images.length > 1 ? (
          <div
            aria-hidden={false}
            className="pointer-events-none absolute inset-x-1 top-1/2 z-[140] flex -translate-y-1/2 items-center justify-between sm:hidden"
          >
            <button
              type="button"
              aria-label={`Show previous ${title} photo`}
              disabled={isDeckAnimating}
              onClick={(event) => {
                event.stopPropagation();
                handleMobileArrowClick(-1);
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-white/80 bg-white/78 text-ocean-deep shadow-[0_10px_24px_rgba(31,110,145,0.2)] backdrop-blur-md transition active:scale-95 disabled:opacity-45"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Show next ${title} photo`}
              disabled={isDeckAnimating}
              onClick={(event) => {
                event.stopPropagation();
                handleMobileArrowClick(1);
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-white/80 bg-white/78 text-ocean-deep shadow-[0_10px_24px_rgba(31,110,145,0.2)] backdrop-blur-md transition active:scale-95 disabled:opacity-45"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

function slideSlotsToImage(
  slots: ImageSlot[],
  length: number,
  selectedImageIndex: number,
) {
  const activeImageIndex = getActiveImageIndex(slots);

  if (
    activeImageIndex === undefined ||
    selectedImageIndex === activeImageIndex ||
    selectedImageIndex < 0 ||
    selectedImageIndex >= length
  ) {
    return slots;
  }

  const selectedSlot = slots.find((slot) => slot.imageIndex === selectedImageIndex);
  const direction =
    selectedSlot?.offset ||
    getShortestSlideDirection(activeImageIndex, selectedImageIndex, length);

  // Rebuild slots from the selected image so every layer moves like a carousel.
  return createImageSlotsForActiveIndex(selectedImageIndex, length, direction);
}

function slideSlotsByDirection(
  slots: ImageSlot[],
  length: number,
  direction: number,
) {
  const activeImageIndex = getActiveImageIndex(slots);

  if (activeImageIndex === undefined || length <= 1) {
    return slots;
  }

  const nextImageIndex = wrapIndex(activeImageIndex + direction, length);
  return createImageSlotsForActiveIndex(nextImageIndex, length, direction);
}

function getShortestSlideDirection(
  activeImageIndex: number,
  selectedImageIndex: number,
  length: number,
) {
  const forwardDistance = wrapIndex(selectedImageIndex - activeImageIndex, length);
  const backwardDistance = forwardDistance - length;

  return forwardDistance <= Math.abs(backwardDistance) ? 1 : -1;
}

function getActiveImageIndex(slots: ImageSlot[]) {
  return slots.find((slot) => slot.offset === frontSlotOffset)?.imageIndex;
}

function getStackLayers(
  images: MemoryImage[],
  imageSlots: ImageSlot[],
  large: boolean,
  metrics: StackMetrics,
): StackLayer[] {
  if (images.length === 0) {
    return [];
  }

  return imageSlots
    .map((slot) => {
      const image = images[slot.imageIndex];

      if (!image) {
        return null;
      }

      const offset = slot.offset;
      const depth = Math.abs(offset);
      const x = getLayerTranslateX(offset, metrics);

      return {
        image,
        imageIndex: slot.imageIndex,
        offset,
        x,
        y: depth * (large ? 12 : 9),
        scale: depth === 0 ? 1 : depth === 1 ? 0.86 : 0.74,
        opacity: depth === 0 ? 1 : depth === 1 ? 0.82 : depth === 2 ? 0.48 : 0,
        rotate: 0,
        zIndex:
          depth === 0
            ? frontLayerZIndex
            : depth === 1
              ? nearLayerZIndex
              : depth === 2
                ? farLayerZIndex
                : 0,
        depth,
      };
    })
    .filter((layer): layer is StackLayer => Boolean(layer));
}

function createInitialImageSlots(length: number): ImageSlot[] {
  return createImageSlotsForActiveIndex(0, length, 1);
}

function createImageSlotsForActiveIndex(
  activeImageIndex: number,
  length: number,
  direction: number,
) {
  return Array.from({ length }, (_, imageIndex) => ({
    imageIndex,
    offset: getCarouselOffset(imageIndex, activeImageIndex, length, direction),
  }));
}

function getCarouselOffset(
  imageIndex: number,
  activeImageIndex: number,
  length: number,
  direction: number,
) {
  if (imageIndex === activeImageIndex) {
    return frontSlotOffset;
  }

  const forwardOffset = wrapIndex(imageIndex - activeImageIndex, length);
  const backwardOffset = forwardOffset - length;

  if (forwardOffset < Math.abs(backwardOffset)) {
    return forwardOffset;
  }

  if (forwardOffset > Math.abs(backwardOffset)) {
    return backwardOffset;
  }

  if (length === 2) {
    // With two photos, keep the inactive image on the side it should enter from.
    return direction > 0 ? -1 : 1;
  }

  return direction < 0 ? backwardOffset : forwardOffset;
}

function getVisibleOffsets(length: number) {
  if (length === 1) {
    return [0];
  }

  if (length === 2) {
    return [0, 1];
  }

  if (length === 3) {
    return [0, -1, 1];
  }

  if (length === 4) {
    return [0, -1, 1, -2];
  }

  return [0, -1, 1, -2, 2];
}

function getMaxVisibleDepth(length: number) {
  return getVisibleOffsets(length).reduce(
    (maxDepth, offset) => Math.max(maxDepth, Math.abs(offset)),
    0,
  );
}

function getStackMetrics(
  containerWidth: number,
  large: boolean,
  maxDepth: number,
  imageCount: number,
): StackMetrics {
  // The card width and side offsets are calculated together to prevent overflow.
  const safeWidth = Math.max(containerWidth || (large ? 760 : 520), 180);
  const compact = safeWidth < 520;
  const smallDeck = imageCount > 1 && imageCount <= 3;
  const sidePadding = compact ? 6 : large ? 18 : 18;
  const targetWidth = large ? 560 : 360;
  const sideRatio =
    maxDepth >= 2
      ? compact
        ? 0.11
        : large
          ? 0.34
          : 0.38
      : maxDepth === 1
        ? compact
          ? smallDeck
            ? 0.12
            : 0.08
          : large
            ? 0.2
            : 0.22
        : 0;
  const widthRatio =
    maxDepth === 0
      ? compact
        ? 0.95
        : large
          ? 0.78
          : 0.68
      : maxDepth === 1
        ? compact
          ? smallDeck
            ? 0.88
            : 0.9
          : large
            ? 0.76
            : 0.64
        : compact
          ? 0.86
          : large
            ? 0.7
            : 0.64;
  const fitWidth = sideRatio
    ? (safeWidth - sidePadding * 2) / (1 + sideRatio * 2)
    : safeWidth - sidePadding * 2;
  const minimumWidth = Math.min(
    large ? 172 : 150,
    Math.max(132, safeWidth - sidePadding * 2),
  );
  const cardWidth = Math.floor(
    clamp(
      Math.min(targetWidth, safeWidth * widthRatio, fitWidth),
      minimumWidth,
      targetWidth,
    ),
  );
  const availableOffset = Math.max(
    0,
    (safeWidth - cardWidth) / 2 - sidePadding,
  );
  const nearOffset = Math.min(
    compact && smallDeck ? cardWidth * 0.24 : availableOffset,
    cardWidth * (compact ? (smallDeck ? 0.24 : 0.14) : large ? 0.22 : 0.22),
    large ? 108 : 76,
  );
  const farOffset = Math.min(
    availableOffset,
    cardWidth * (compact ? 0.22 : large ? 0.34 : 0.38),
    large ? 176 : 136,
  );
  const minHeight = Math.round(
    cardWidth * 1.25 +
      (large ? (compact ? 72 : 48) : compact ? 54 : 36) +
      Math.min(maxDepth, 2) * (compact ? 8 : 12),
  );

  return {
    cardWidth,
    nearOffset,
    farOffset,
    minHeight,
  };
}

function getLayerTranslateX(offset: number, metrics: StackMetrics) {
  const depth = Math.abs(offset);

  if (depth === 0) {
    return 0;
  }

  return (
    Math.sign(offset) * (depth === 1 ? metrics.nearOffset : metrics.farOffset)
  );
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateWidth = () => setWidth(element.getBoundingClientRect().width);
    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return width;
}

function PhotoHoverParticles({ seed }: { seed: number }) {
  return (
    <span aria-hidden="true" className="memory-photo-particle-field">
      {hoverParticles.map((particle) => {
        const particleStyle = {
          "--particle-x": `${(particle.x + seed * 11) % 100}%`,
          "--particle-y": `${particle.y}%`,
          "--particle-drift": `${particle.drift + seed * 6}px`,
          "--particle-size": `${particle.size}px`,
          "--particle-delay": `${particle.delay + seed * 0.08}s`,
          "--particle-duration": `${particle.duration}s`,
        } as CSSProperties;

        return (
          <span
            key={particle.id}
            className={cn(
              "memory-photo-particle",
              particle.kind === "bubble" && "memory-photo-bubble",
              particle.kind === "spark" && "memory-photo-stardust",
            )}
            style={particleStyle}
          />
        );
      })}
    </span>
  );
}
