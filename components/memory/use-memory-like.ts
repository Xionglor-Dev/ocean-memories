"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type LikeResponse = {
  liked: boolean;
  likesCount: number;
};

export function useMemoryLike(memoryId: string, initialLiked = false, initialCount = 0) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);
  const likedRef = useRef(initialLiked);
  const countRef = useRef(initialCount);
  const requestIdRef = useRef(0);
  const syncTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // This is the last server-confirmed value, used to rollback failed likes.
  const confirmedStateRef = useRef({ liked: initialLiked, count: initialCount });

  useEffect(() => {
    likedRef.current = initialLiked;
    countRef.current = initialCount;
    confirmedStateRef.current = { liked: initialLiked, count: initialCount };
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialCount, initialLiked, memoryId]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }

      abortControllerRef.current?.abort();
    };
  }, []);

  const updateOptimisticState = useCallback((nextLiked: boolean, nextCount: number) => {
    likedRef.current = nextLiked;
    countRef.current = nextCount;
    setLiked(nextLiked);
    setCount(nextCount);
  }, []);

  const syncLikeState = useCallback(
    (targetLiked: boolean) => {
      // Newer requests win, which prevents rapid taps from applying stale results.
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsPending(true);

      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }

      abortControllerRef.current?.abort();

      syncTimerRef.current = window.setTimeout(async () => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
          const response = await fetch("/api/likes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memoryId,
              mode: targetLiked ? "like" : "unlike",
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error("Unable to update like");
          }

          const data = (await response.json()) as LikeResponse;

          if (requestId === requestIdRef.current) {
            confirmedStateRef.current = {
              liked: data.liked,
              count: data.likesCount,
            };
            updateOptimisticState(data.liked, data.likesCount);
          }
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          if (requestId === requestIdRef.current) {
            updateOptimisticState(
              confirmedStateRef.current.liked,
              confirmedStateRef.current.count,
            );
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsPending(false);
          }
        }
      }, 120);
    },
    [memoryId, updateOptimisticState],
  );

  const toggleLike = useCallback(
    (options?: { forceLike?: boolean }) => {
      const currentLiked = likedRef.current;
      const currentCount = countRef.current;

      if (options?.forceLike && currentLiked) {
        return;
      }

      // Optimistic UI makes the heart feel immediate while the request syncs.
      const nextLiked = options?.forceLike ? true : !currentLiked;
      const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

      updateOptimisticState(nextLiked, nextCount);
      syncLikeState(nextLiked);
    },
    [syncLikeState, updateOptimisticState],
  );

  return {
    liked,
    count,
    isPending,
    toggleLike,
  };
}
