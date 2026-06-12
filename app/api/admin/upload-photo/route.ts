import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { MEMORY_IMAGES_BUCKET } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/utils";

const maxImageFileSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireAdmin();

  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (!allowedImageTypes.has(contentType)) {
    return NextResponse.json(
      { message: "Please upload JPG, PNG, WEBP, or GIF photos only." },
      { status: 400 },
    );
  }

  if (contentLength > maxImageFileSize) {
    return NextResponse.json(
      { message: "Each photo must be 10 MB or less." },
      { status: 413 },
    );
  }

  const arrayBuffer = await request.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    return NextResponse.json(
      { message: "The selected photo was empty." },
      { status: 400 },
    );
  }

  if (arrayBuffer.byteLength > maxImageFileSize) {
    return NextResponse.json(
      { message: "Each photo must be 10 MB or less." },
      { status: 413 },
    );
  }

  const fileName = getUploadFileName(request);
  const safeName = sanitizeFileName(fileName);
  // Prefix with a UUID so two uploads with the same filename never collide.
  const storagePath = `uploads/${randomUUID()}-${safeName}`;
  const supabase = createSupabaseServiceClient();
  const blob = new Blob([arrayBuffer], { type: contentType });

  const { error } = await supabase.storage
    .from(MEMORY_IMAGES_BUCKET)
    .upload(storagePath, blob, {
      contentType,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Photo upload failed." },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEMORY_IMAGES_BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({
    image_url: publicUrl,
    storage_path: storagePath,
  });
}

function getUploadFileName(request: NextRequest) {
  const rawFileName = request.headers.get("x-file-name") || "memory-photo";

  try {
    return decodeURIComponent(rawFileName);
  } catch {
    return rawFileName;
  }
}
