"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { MEMORY_IMAGES_BUCKET } from "@/lib/env";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

const initialError = "Something went wrong. Please try again.";
const maxImageFileSize = 10 * 1024 * 1024;
const maxTotalUploadSize = 50 * 1024 * 1024;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UploadedPhotoMetadata = {
  image_url: string;
  storage_path: string;
};

function valueAsString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isImageFile(entry: FormDataEntryValue): entry is File {
  return entry instanceof File && entry.size > 0;
}

function parseUploadedPhotos(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: true as const, photos: [] };
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return { ok: false as const, message: "Uploaded photo data was invalid." };
    }

    const photos = parsed.filter(
      (photo): photo is UploadedPhotoMetadata =>
        typeof photo === "object" &&
        photo !== null &&
        "image_url" in photo &&
        "storage_path" in photo &&
        typeof photo.image_url === "string" &&
        typeof photo.storage_path === "string" &&
        photo.image_url.length > 0 &&
        photo.storage_path.length > 0,
    );

    if (photos.length !== parsed.length) {
      return { ok: false as const, message: "Uploaded photo data was invalid." };
    }

    return { ok: true as const, photos };
  } catch {
    return { ok: false as const, message: "Uploaded photo data was invalid." };
  }
}

export async function saveMemoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const memoryId = valueAsString(formData.get("memory_id"));
  const date = valueAsString(formData.get("date"));
  const title = valueAsString(formData.get("title")) || null;
  const content = valueAsString(formData.get("content"));
  const isPublished = formData.get("is_published") === "on";
  const files = formData.getAll("photos").filter(isImageFile);
  const uploadedPhotosResult = parseUploadedPhotos(formData.get("uploaded_photos"));

  if (!uploadedPhotosResult.ok) {
    return {
      ok: false,
      message: uploadedPhotosResult.message,
    };
  }

  const uploadedPhotos = uploadedPhotosResult.photos;

  if (!date || !content) {
    return {
      ok: false,
      message: "Date and story are required.",
    };
  }

  const invalidFile = files.find((file) => !file.type.startsWith("image/"));

  if (invalidFile) {
    return {
      ok: false,
      message: `${invalidFile.name} is not an image file.`,
    };
  }

  const oversizedFile = files.find((file) => file.size > maxImageFileSize);

  if (oversizedFile) {
    return {
      ok: false,
      message: `${oversizedFile.name} is larger than 10 MB.`,
    };
  }

  const totalUploadSize = files.reduce((total, file) => total + file.size, 0);

  if (totalUploadSize > maxTotalUploadSize) {
    return {
      ok: false,
      message: "Please upload 50 MB or less at one time.",
    };
  }

  const supabase = createSupabaseServiceClient();
  const payload = {
    date,
    title,
    content,
    is_published: isPublished,
  };

  let id = memoryId;

  if (id) {
    const { error } = await supabase.from("memories").update(payload).eq("id", id);

    if (error) {
      return { ok: false, message: error.message || initialError };
    }
  } else {
    const { data: orderRows, error: orderError } = await supabase
      .from("memories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    if (orderError) {
      return { ok: false, message: orderError.message || initialError };
    }

    // New memories append to the end of the timeline automatically.
    const nextDisplayOrder = (orderRows?.[0]?.display_order ?? -1) + 1;
    const { data, error } = await supabase
      .from("memories")
      .insert({ ...payload, display_order: nextDisplayOrder })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, message: error?.message || initialError };
    }

    id = data.id;
  }

  const removeImageIds = formData
    .getAll("remove_image_ids")
    .map(String)
    .filter((imageId) => uuidPattern.test(imageId));

  if (removeImageIds.length > 0) {
    // Remove storage files first so deleted database rows do not leave orphaned photos.
    const { data: imagesToRemove } = await supabase
      .from("memory_images")
      .select("id, storage_path")
      .in("id", removeImageIds)
      .eq("memory_id", id);

    const storagePaths = (imagesToRemove || []).map((image) => image.storage_path);

    if (storagePaths.length > 0) {
      await supabase.storage.from(MEMORY_IMAGES_BUCKET).remove(storagePaths);
      await supabase.from("memory_images").delete().in("id", removeImageIds);
    }
  }

  if (files.length > 0 || uploadedPhotos.length > 0) {
    const { data: existingImages } = await supabase
      .from("memory_images")
      .select("sort_order")
      .eq("memory_id", id);

    let nextSortOrder =
      Math.max(-1, ...(existingImages || []).map((image) => image.sort_order)) + 1;

    // New upload API already put these files in Storage; persist their metadata.
    for (const photo of uploadedPhotos) {
      const { error: imageError } = await supabase.from("memory_images").insert({
        memory_id: id,
        image_url: photo.image_url,
        storage_path: photo.storage_path,
        sort_order: nextSortOrder,
      });

      if (imageError) {
        return { ok: false, message: imageError.message || initialError };
      }

      nextSortOrder += 1;
    }

    // This legacy path is kept as a fallback if photos arrive in the form body.
    for (const file of files) {
      const safeName = sanitizeFileName(file.name);
      const storagePath = `${id}/${randomUUID()}-${safeName}`;
      const blob = new Blob([await file.arrayBuffer()], {
        type: file.type || "image/jpeg",
      });

      const { error: uploadError } = await supabase.storage
        .from(MEMORY_IMAGES_BUCKET)
        .upload(storagePath, blob, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        return { ok: false, message: uploadError.message || initialError };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEMORY_IMAGES_BUCKET).getPublicUrl(storagePath);

      const { error: imageError } = await supabase.from("memory_images").insert({
        memory_id: id,
        image_url: publicUrl,
        storage_path: storagePath,
        sort_order: nextSortOrder,
      });

      if (imageError) {
        return { ok: false, message: imageError.message || initialError };
      }

      nextSortOrder += 1;
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/memory/${id}`);

  return {
    ok: true,
    message: isPublished
      ? "Publishing is complete."
      : "Draft saved.",
    memoryId: id,
  };
}

export async function deleteMemoryAction(memoryId: string): Promise<ActionState> {
  await requireAdmin();

  if (!uuidPattern.test(memoryId)) {
    return { ok: false, message: "Invalid memory id." };
  }

  const supabase = createSupabaseServiceClient();
  const { data: images } = await supabase
    .from("memory_images")
    .select("storage_path")
    .eq("memory_id", memoryId);

  const storagePaths = (images || []).map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    // Delete the backing files before deleting the memory row.
    await supabase.storage.from(MEMORY_IMAGES_BUCKET).remove(storagePaths);
  }

  const { error } = await supabase.from("memories").delete().eq("id", memoryId);

  if (error) {
    return { ok: false, message: error.message || initialError };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/memory/${memoryId}`);

  return { ok: true, message: "Memory deleted." };
}

export async function deleteMemoryImageAction(
  memoryId: string,
  imageId: string,
): Promise<ActionState> {
  await requireAdmin();

  if (!uuidPattern.test(memoryId) || !uuidPattern.test(imageId)) {
    return { ok: false, message: "Invalid photo id." };
  }

  const supabase = createSupabaseServiceClient();
  const { data: image, error: imageError } = await supabase
    .from("memory_images")
    .select("id, storage_path")
    .eq("id", imageId)
    .eq("memory_id", memoryId)
    .single();

  if (imageError || !image) {
    return { ok: false, message: imageError?.message || "Photo was not found." };
  }

  if (image.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(MEMORY_IMAGES_BUCKET)
      .remove([image.storage_path]);

    if (storageError) {
      return { ok: false, message: storageError.message || initialError };
    }
  }

  const { error } = await supabase
    .from("memory_images")
    .delete()
    .eq("id", imageId)
    .eq("memory_id", memoryId);

  if (error) {
    return { ok: false, message: error.message || initialError };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/memory/${memoryId}`);

  return { ok: true, message: "Photo deleted." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
