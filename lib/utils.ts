import type { ClassValue } from "@/lib/utils.types";

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flatMap((input) => {
      if (!input) {
        return [];
      }

      if (typeof input === "string") {
        return [input];
      }

      if (typeof input === "number") {
        return [String(input)];
      }

      if (Array.isArray(input)) {
        return input.filter(Boolean).map(String);
      }

      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .join(" ");
}

export function formatMemoryDate(date: string | Date) {
  // Normalize date-only values at local midnight so display stays stable.
  const parsed = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function createExcerpt(content: string, maxLength = 150) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

export function sanitizeFileName(fileName: string) {
  // Storage paths should be readable, short, and safe across browsers.
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 44);

  return `${baseName || "memory-photo"}.${extension}`;
}
