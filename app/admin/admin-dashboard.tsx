"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import {
  deleteMemoryAction,
  deleteMemoryImageAction,
  saveMemoryAction,
  signOutAction,
} from "@/app/admin/actions";
import { PhotoStack } from "@/components/memory/photo-stack";
import { formatMemoryDate } from "@/lib/utils";
import type { ActionState, MemoryImage, MemoryWithImages } from "@/lib/types";

type AdminDashboardProps = {
  memories: MemoryWithImages[];
};

const emptyState: ActionState = {
  ok: false,
  message: "",
};

const maxPhotoFileSize = 10 * 1024 * 1024;
const maxPendingPhotoSize = 50 * 1024 * 1024;
const allowedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function AdminDashboard({ memories }: AdminDashboardProps) {
  const router = useRouter();
  const editorSectionRef = useRef<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(memories[0]?.id || null);
  const selectedMemory = memories.find((memory) => memory.id === selectedId) || null;
  const [state, formAction, isSaving] = useActionState(saveMemoryAction, emptyState);
  const [deleteState, setDeleteState] = useState<ActionState>(emptyState);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [refreshNotice, setRefreshNotice] = useState("");
  const [memorySearch, setMemorySearch] = useState("");
  const [highlightedTitleQuery, setHighlightedTitleQuery] = useState("");
  const filteredMemories = useMemo(() => {
    const query = memorySearch.trim().toLowerCase();

    if (!query) {
      return memories;
    }

    return memories.filter((memory) =>
      (memory.title || "Untitled memory").toLowerCase().includes(query),
    );
  }, [memories, memorySearch]);

  useEffect(() => {
    if (!state.ok) {
      setRefreshNotice("");
      return;
    }

    if (state.memoryId) {
      setSelectedId(state.memoryId);
    }

    setRefreshNotice("Latest data refreshed. You are viewing the current saved memory.");
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, state]);

  const startNewMemory = () => {
    setSelectedId(null);
    setDeleteState(emptyState);
    scrollEditorIntoViewOnPhone(editorSectionRef);
  };

  const deleteSelectedMemory = () => {
    if (!selectedMemory) {
      return;
    }

    const confirmed = window.confirm("Delete this memory and all of its photos?");

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteMemoryAction(selectedMemory.id);
      setDeleteState(result);

      if (result.ok) {
        setSelectedId(null);
      }
    });
  };

  return (
    <div className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[310px_minmax(0,1fr)] lg:px-8">
      <aside className="rounded-[8px] bg-white/88 p-4 shadow-memory ring-1 ring-white/75 backdrop-blur-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-handwriting text-3xl font-semibold text-ocean-deep">
              Dashboard
            </p>
            <h1 className="text-xl font-bold text-ocean-text">Memories</h1>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ocean-deep text-white shadow-soft transition hover:bg-ocean-seaGlass hover:text-ocean-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-timeline/35"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>

        <label className="mt-5 block">
          <span className="sr-only">Search memory title</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/70"
              aria-hidden="true"
            />
            <input
              type="search"
              value={memorySearch}
              onChange={(event) => {
                setMemorySearch(event.target.value);
                setHighlightedTitleQuery("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setHighlightedTitleQuery(event.currentTarget.value.trim().toLowerCase());
                }
              }}
              placeholder="Search title"
              className="admin-memory-field w-full rounded-full border-2 border-ocean-timeline/55 bg-white/78 py-3 pl-11 pr-4 text-sm font-semibold text-ocean-text shadow-soft outline-none transition placeholder:text-ocean-text/45 focus:border-ocean-deep/70 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={startNewMemory}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ocean-heart px-4 py-3 font-bold text-white shadow-soft transition hover:bg-[#eb4c79] hover:text-ocean-deep"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          New Memory
        </button>

        <div className="mt-5 space-y-2">
          {filteredMemories.map((memory) => {
            const titleText = memory.title || "Untitled memory";
            const isTitleHighlighted =
              highlightedTitleQuery.length > 0 &&
              titleText.toLowerCase().includes(highlightedTitleQuery);

            return (
              <button
                type="button"
                key={memory.id}
                onClick={() => {
                  setSelectedId(memory.id);
                  setDeleteState(emptyState);
                  scrollEditorIntoViewOnPhone(editorSectionRef);
                }}
                className={`w-full rounded-[8px] border px-3 py-3 text-left transition ${
                  selectedId === memory.id
                    ? "border-ocean-timeline bg-ocean-background shadow-soft"
                    : "border-white/80 bg-white/80 hover:border-ocean-timeline/70 hover:bg-white"
                }`}
              >
                <span className="calligraffitti-text block text-2xl text-ocean-deep">
                  {formatMemoryDate(memory.date)}
                </span>
                <span
                  className={`mt-1 inline-block max-w-full truncate rounded-full text-sm font-bold transition ${
                    isTitleHighlighted
                      ? "bg-ocean-heart/16 px-3 py-1 text-ocean-heart shadow-[0_8px_22px_rgba(255,92,138,0.16)]"
                      : "text-ocean-text"
                  }`}
                >
                  {titleText}
                </span>
                <span
                  className={`mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-soft ${
                    memory.is_published ? "text-emerald-500" : "text-ocean-heart"
                  }`}
                  aria-label={memory.is_published ? "Published" : "Draft"}
                  title={memory.is_published ? "Published" : "Draft"}
                >
                  {memory.is_published ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}

          {memories.length === 0 ? (
            <p className="rounded-[8px] bg-white/80 p-4 text-sm leading-6 text-ocean-text/70 shadow-soft ring-1 ring-white/80">
              Your first memory will appear here after saving.
            </p>
          ) : null}
          {memories.length > 0 && filteredMemories.length === 0 ? (
            <p className="rounded-[8px] bg-white/80 p-4 text-sm leading-6 text-ocean-text/70 shadow-soft ring-1 ring-white/80">
              No memory title matches your search.
            </p>
          ) : null}
        </div>
      </aside>

      <section
        ref={editorSectionRef}
        id="memory-editor"
        className="grid min-w-0 scroll-mt-6 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <MemoryEditor
          key={selectedMemory?.id || "new"}
          selectedMemory={selectedMemory}
          action={formAction}
          isSaving={isSaving}
          state={state}
          refreshNotice={isRefreshing ? "Refreshing latest data..." : refreshNotice}
          deleteState={deleteState}
          isDeleting={isDeleting}
          onDelete={deleteSelectedMemory}
        />
      </section>
    </div>
  );
}

function scrollEditorIntoViewOnPhone(ref: RefObject<HTMLElement | null>) {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.matchMedia("(max-width: 1023px)").matches) {
    return;
  }

  window.requestAnimationFrame(() => {
    ref.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  });
}

type MemoryEditorProps = {
  selectedMemory: MemoryWithImages | null;
  action: (payload: FormData) => void;
  isSaving: boolean;
  state: ActionState;
  refreshNotice: string;
  deleteState: ActionState;
  isDeleting: boolean;
  onDelete: () => void;
};

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadedPhotoMetadata = {
  image_url: string;
  storage_path: string;
};

function MemoryEditor({
  selectedMemory,
  action,
  isSaving,
  state,
  refreshNotice,
  deleteState,
  isDeleting,
  onDelete,
}: MemoryEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotosRef = useRef<PendingPhoto[]>([]);
  const [date, setDate] = useState(selectedMemory?.date || getTodayInputDate());
  const [title, setTitle] = useState(selectedMemory?.title || "");
  const [content, setContent] = useState(selectedMemory?.content || "");
  const [isPublished, setIsPublished] = useState(selectedMemory?.is_published || false);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [imageDeleteState, setImageDeleteState] = useState<ActionState>(emptyState);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isDeletingImage, startImageDeleteTransition] = useTransition();
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const isSubmitting = isSaving || isUploadingPhotos;

  useEffect(() => {
    pendingPhotosRef.current = pendingPhotos;
  }, [pendingPhotos]);

  useEffect(() => {
    const input = fileInputRef.current;

    if (!input || typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    pendingPhotos.forEach((photo) => transfer.items.add(photo.file));
    input.files = transfer.files;
  }, [pendingPhotos]);

  useEffect(() => {
    return () => {
      pendingPhotosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (!state.ok) {
      return;
    }

    pendingPhotosRef.current.forEach((photo) =>
      URL.revokeObjectURL(photo.previewUrl),
    );
    pendingPhotosRef.current = [];
    setPendingPhotos([]);
    setPhotoError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [state]);

  const existingImages = useMemo(
    () =>
      (selectedMemory?.memory_images || []).filter(
        (image) => !deletedImageIds.includes(image.id),
      ),
    [deletedImageIds, selectedMemory],
  );

  const photoPreviews = useMemo<MemoryImage[]>(
    () =>
      pendingPhotos.map((photo, index) => ({
        id: photo.id,
        memory_id: selectedMemory?.id || "preview",
        image_url: photo.previewUrl,
        storage_path: "",
        sort_order: existingImages.length + index,
        created_at: new Date(photo.file.lastModified || Date.now()).toISOString(),
      })),
    [existingImages.length, pendingPhotos, selectedMemory],
  );

  const previewMemory = useMemo<MemoryWithImages>(
    () => ({
      id: selectedMemory?.id || "preview",
      date: date || new Date().toISOString().slice(0, 10),
      title: title || null,
      content: content || "Your story preview will appear here as you write.",
      display_order: selectedMemory?.display_order ?? 0,
      is_published: isPublished,
      likes_count: selectedMemory?.likes_count || 0,
      created_at: selectedMemory?.created_at || new Date().toISOString(),
      updated_at: selectedMemory?.updated_at || new Date().toISOString(),
      memory_images: [...existingImages, ...photoPreviews],
      has_liked: false,
    }),
    [content, date, existingImages, isPublished, photoPreviews, selectedMemory, title],
  );

  const addPendingFiles = (fileList: FileList | null) => {
    const entries = Array.from(fileList || []);
    const files = entries.filter(
      (file) => file.type.startsWith("image/") && allowedPhotoTypes.has(file.type),
    );

    if (entries.length === 0) {
      return;
    }

    if (files.length === 0) {
      setPhotoError("Please choose JPG, PNG, WEBP, or GIF photos only.");
      return;
    }

    setPendingPhotos((current) => {
      let currentSize = current.reduce((total, photo) => total + photo.file.size, 0);
      const acceptedFiles: File[] = [];
      let skippedFiles = entries.length - files.length;

      // Keep uploads inside API limits before the user presses Save.
      files.forEach((file) => {
        if (file.size > maxPhotoFileSize) {
          skippedFiles += 1;
          return;
        }

        if (currentSize + file.size > maxPendingPhotoSize) {
          skippedFiles += 1;
          return;
        }

        currentSize += file.size;
        acceptedFiles.push(file);
      });

      setPhotoError(
        skippedFiles > 0
          ? "Some photos were not added. Keep each photo under 10 MB and total new photos under 50 MB."
          : "",
      );

      if (acceptedFiles.length === 0) {
        return current;
      }

      return [
        ...current,
        ...acceptedFiles.map((file, index) =>
          createPendingPhoto(file, current.length + index),
        ),
      ];
    });
  };

  const removePendingPhoto = (photoId: string) => {
    const photo = pendingPhotos.find((pendingPhoto) => pendingPhoto.id === photoId);

    if (photo) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    setPendingPhotos((current) =>
      current.filter((pendingPhoto) => pendingPhoto.id !== photoId),
    );
    setPhotoError("");
  };

  const deleteExistingPhoto = (imageId: string) => {
    if (!selectedMemory || deletingImageId) {
      return;
    }

    const confirmed = window.confirm("Delete this photo now?");

    if (!confirmed) {
      return;
    }

    setImageDeleteState(emptyState);
    setDeletingImageId(imageId);

    startImageDeleteTransition(async () => {
      const result = await deleteMemoryImageAction(selectedMemory.id, imageId);
      setImageDeleteState(result);

      if (result.ok) {
        // Hide the photo immediately, then refresh so server data catches up.
        setDeletedImageIds((current) =>
          current.includes(imageId) ? current : [...current, imageId],
        );
        router.refresh();
      }

      setDeletingImageId(null);
    });
  };

  const submitMemory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    // Files are uploaded through the raw upload API, not the Server Action body.
    formData.delete("photos");
    setPhotoError("");

    if (pendingPhotos.length === 0) {
      startTransition(() => {
        action(formData);
      });
      return;
    }

    setIsUploadingPhotos(true);

    try {
      const uploadedPhotos: UploadedPhotoMetadata[] = [];

      for (const photo of pendingPhotos) {
        uploadedPhotos.push(await uploadPendingPhoto(photo.file));
      }

      // The Server Action only receives lightweight metadata after upload.
      formData.set("uploaded_photos", JSON.stringify(uploadedPhotos));
      startTransition(() => {
        action(formData);
      });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Photos could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  return (
    <>
      <form
        onSubmit={submitMemory}
        className="min-w-0 overflow-hidden rounded-[8px] bg-white/88 p-4 shadow-memory ring-1 ring-white/75 backdrop-blur-sm sm:p-6"
      >
        <input type="hidden" name="memory_id" value={selectedMemory?.id || ""} />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-handwriting text-3xl font-semibold text-ocean-deep">
              {selectedMemory ? "Edit Memory" : "Create Memory"}
            </p>
            <h2 className="text-2xl font-bold text-ocean-text">
              {title || selectedMemory?.title || "Untitled memory"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedMemory ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-ocean-heart/10 px-4 py-2 font-semibold text-ocean-heart transition hover:bg-ocean-heart/15 disabled:cursor-wait disabled:opacity-70"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-white shadow-soft transition hover:text-ocean-deep disabled:cursor-wait disabled:opacity-70 ${
                isPublished
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-ocean-heart hover:bg-[#eb4c79]"
              }`}
            >
              {isPublished ? (
                <Send className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {isUploadingPhotos
                ? "Uploading"
                : isSaving
                  ? "Saving"
                  : isPublished
                    ? "Publish Memory"
                    : "Save Draft"}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="block">
            <span className="text-sm font-bold text-ocean-text">Date</span>
            <input
              type="date"
              name="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="admin-memory-field mt-2 block w-full min-w-0 max-w-full rounded-[8px] border-2 border-ocean-timeline/65 bg-white/88 px-3 py-3 text-ocean-text outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(124,203,255,0.12)] transition focus:border-ocean-deep/70 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]"
            />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-ocean-text">Title</span>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="admin-memory-field mt-2 w-full rounded-[8px] border-2 border-ocean-timeline/65 bg-white/88 px-3 py-3 text-ocean-text outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(124,203,255,0.12)] transition focus:border-ocean-deep/70 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]"
            placeholder="Optional"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-ocean-text">Story</span>
          <textarea
            name="content"
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={9}
            className="admin-memory-field mt-2 w-full resize-y rounded-[8px] border-2 border-ocean-timeline/65 bg-white/88 px-3 py-3 leading-7 text-ocean-text outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(124,203,255,0.12)] transition focus:border-ocean-deep/70 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,203,255,0.22)]"
            placeholder="Write the memory with all the details worth keeping..."
          />
        </label>

        <div className="mt-5 rounded-[8px] border border-ocean-timeline/35 bg-ocean-foam p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              addPendingFiles(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-ocean-text">New photos</span>
              <p className="mt-1 text-sm text-ocean-text/65">
                {pendingPhotos.length > 0
                  ? `${pendingPhotos.length} selected`
                  : "No photos selected"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Add photos"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ocean-heart/80 text-white shadow-soft transition hover:bg-ocean-heart/95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-heart/25"
            >
              <Plus className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {photoError ? (
            <p className="mt-3 rounded-[8px] bg-ocean-heart/10 px-3 py-2 text-sm font-semibold text-ocean-heart">
              {photoError}
            </p>
          ) : null}
          {isUploadingPhotos ? (
            <p className="mt-3 rounded-[8px] bg-ocean-seaGlass/35 px-3 py-2 text-sm font-semibold text-ocean-deep">
              Uploading photos before saving...
            </p>
          ) : null}

          {pendingPhotos.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {pendingPhotos.map((photo, index) => (
                <li
                  key={photo.id}
                  className="flex items-center gap-3 rounded-[8px] bg-white/80 p-2 shadow-soft ring-1 ring-white/80"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-ocean-background shadow-soft">
                    <Image
                      src={photo.previewUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ocean-text">
                      {index + 1}. {photo.file.name}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-ocean-text/55">
                      {formatFileSize(photo.file.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${photo.file.name}`}
                    onClick={() => removePendingPhoto(photo.id)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-heart/10 text-ocean-heart transition hover:bg-ocean-heart hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-heart/20"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {existingImages.length ? (
          <fieldset className="mt-5 rounded-[8px] border border-ocean-timeline/35 bg-white/70 p-4">
            <legend className="px-1 text-sm font-bold text-ocean-text">
              Existing photos
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingImages.map((image, index) => {
                const isDeletingThisImage = deletingImageId === image.id;

                return (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-[8px] bg-white shadow-soft ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-memory"
                >
                  <span className="relative block h-full w-full">
                    <Image
                      src={image.image_url}
                      alt="Existing memory photo"
                      fill
                      sizes="(max-width: 640px) 50vw, 160px"
                      className={`object-cover transition duration-300 ${
                        isDeletingThisImage ? "scale-105" : ""
                      }`}
                    />
                  </span>
                  <span
                    className={`pointer-events-none absolute inset-0 bg-ocean-text/45 transition ${
                      isDeletingThisImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={`Delete existing photo ${index + 1}`}
                    disabled={isDeletingImage}
                    onClick={() => deleteExistingPhoto(image.id)}
                    className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ocean-heart shadow-soft ring-1 ring-ocean-heart/15 transition hover:bg-ocean-heart hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-heart/25 disabled:cursor-wait disabled:opacity-70"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {isDeletingThisImage ? (
                    <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-ocean-heart shadow-soft">
                      Deleting
                    </span>
                  ) : null}
                </div>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {imageDeleteState.message ? (
          <p
            role={imageDeleteState.ok ? "status" : "alert"}
            className={`mt-4 rounded-[8px] px-4 py-3 text-sm font-semibold ${
              imageDeleteState.ok
                ? "bg-ocean-seaGlass/35 text-ocean-deep"
                : "bg-ocean-heart/10 text-ocean-heart"
            }`}
          >
            {imageDeleteState.message}
          </p>
        ) : null}

        <label className="mt-5 inline-flex cursor-pointer items-center gap-3 font-semibold text-ocean-text">
          <input
            type="checkbox"
            name="is_published"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="peer sr-only"
          />
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-[5px] border-2 transition peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-400/30 ${
              isPublished
                ? "border-emerald-500 bg-emerald-500 text-white hover:border-emerald-400 hover:bg-emerald-400"
                : "border-ocean-heart/55 bg-white/85 hover:bg-white"
            }`}
            aria-hidden="true"
          >
            {isPublished ? <Check className="h-4 w-4" /> : null}
          </span>
          Published
        </label>

        {state.message ? (
          <div
            role={state.ok ? "status" : "alert"}
            className={`mt-4 rounded-[8px] px-4 py-3 text-sm font-semibold ${
              state.ok
                ? "bg-ocean-seaGlass/35 text-ocean-deep"
                : "bg-ocean-heart/10 text-ocean-heart"
            }`}
          >
            <p>{state.message}</p>
            {state.ok && refreshNotice ? (
              <p className="mt-1 text-xs font-bold text-ocean-text/65">
                {refreshNotice}
              </p>
            ) : null}
          </div>
        ) : null}

        {deleteState.message ? (
          <p
            className={`mt-4 rounded-[8px] px-4 py-3 text-sm font-semibold ${
              deleteState.ok
                ? "bg-ocean-seaGlass/35 text-ocean-deep"
                : "bg-ocean-heart/10 text-ocean-heart"
            }`}
          >
            {deleteState.message}
          </p>
        ) : null}
      </form>

      <aside className="rounded-[8px] bg-white/88 p-4 shadow-memory ring-1 ring-white/75 backdrop-blur-sm xl:sticky xl:top-6 xl:h-fit">
        <div className="mb-2 flex items-center gap-2 text-ocean-deep">
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-lg font-bold text-ocean-text">Preview</h2>
        </div>
        <div className="relative overflow-hidden rounded-[8px] bg-white/78 p-3 shadow-soft ring-1 ring-white/75">
          <div className="mb-3 flex items-center gap-2">
            <Pencil className="h-4 w-4 text-ocean-deep" aria-hidden="true" />
            <span className="calligraffitti-text text-2xl text-ocean-deep">
              {formatMemoryDate(previewMemory.date)}
            </span>
          </div>
          <PhotoStack
            images={previewMemory.memory_images}
            title={previewMemory.title || "Preview"}
            date={previewMemory.date}
          />
          <p className="story-copy calligraffitti-text mt-3 text-[1.1rem] leading-8 text-ocean-text/80">
            {previewMemory.content}
          </p>
        </div>
      </aside>
    </>
  );
}

function createPendingPhoto(file: File, index: number): PendingPhoto {
  return {
    id: `pending-${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

async function uploadPendingPhoto(file: File): Promise<UploadedPhotoMetadata> {
  // Raw file uploads avoid Server Action body limits for larger photo sets.
  const response = await fetch("/api/admin/upload-photo", {
    method: "POST",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
    },
    body: file,
  });

  const result = (await response.json().catch(() => null)) as
    | (UploadedPhotoMetadata & { message?: string })
    | null;

  if (!response.ok || !result) {
    throw new Error(result?.message || "Photo upload failed.");
  }

  return {
    image_url: result.image_url,
    storage_path: result.storage_path,
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTodayInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
