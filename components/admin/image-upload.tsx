"use client";

import { ImageUp, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ImageUploadProps = {
  name?: string;
  defaultValue?: string;
  onChange?: (path: string) => void;
  compact?: boolean;
};

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

const HINT = "PNG, JPG, WEBP or GIF · up to 8 MB";

export function ImageUpload({ name, defaultValue, onChange, compact }: ImageUploadProps) {
  const [path, setPath] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [zoomed, setZoomed] = useState(false);

  const blobUrl = useRef<string | undefined>(undefined);

  const showBlob = (file: File) => {
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = URL.createObjectURL(file);
    setPreview(blobUrl.current);
  };

  useEffect(
    () => () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPath("");
    setPreview(undefined);
    setError("");
    onChange?.("");
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setBusy(true);
      setError("");
      showBlob(file);
      const formData = new FormData();
      formData.set("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error);
        const uploaded = (await res.json()).path as string;
        setPath(uploaded);
        setPreview(uploaded);
        onChange?.(uploaded);
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : "Upload failed");
        setPreview(defaultValue);
        setPath(defaultValue ?? "");
      } finally {
        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        blobUrl.current = undefined;
        setBusy(false);
      }
    },
    [defaultValue, onChange],
  );

  const onDropRejected = useCallback(([rejection]: FileRejection[]) => {
    const code = rejection?.errors[0]?.code;
    setError(
      code === "file-too-large"
        ? "Image must be under 8 MB"
        : code === "file-invalid-type"
          ? "Use a PNG, JPG, WEBP or GIF"
          : "That file can't be uploaded",
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT,
    maxSize: MAX_BYTES,
    multiple: false,
    disabled: busy,
  });

  const thumbClass = compact ? "size-10" : "size-16";

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {name && <input type="hidden" name={name} value={path} />}
      <div
        {...getRootProps()}
        className={`flex min-w-0 items-center gap-3 rounded-card border border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          compact ? "p-1.5" : "p-3"
        } ${busy ? "cursor-progress" : "cursor-pointer"} ${
          isDragReject || error
            ? "border-destructive bg-destructive/5"
            : isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:border-brand"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className={`relative ${thumbClass} shrink-0`}>
            <Image
              src={preview}
              alt="Uploaded image preview"
              width={64}
              height={64}
              unoptimized
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(true);
              }}
              className={`size-full cursor-zoom-in rounded-button object-cover transition-opacity ${
                busy ? "opacity-50" : ""
              }`}
            />
            {busy && (
              <Loader2
                aria-hidden
                className="absolute inset-0 m-auto size-5 animate-spin text-foreground"
              />
            )}
            <button
              type="button"
              aria-label="Remove image"
              onClick={clear}
              className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-card transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90"
            >
              <X aria-hidden className="size-3" />
            </button>
          </div>
        ) : (
          <span
            aria-hidden
            className={`flex ${thumbClass} shrink-0 items-center justify-center rounded-button bg-muted text-muted-foreground`}
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImageUp className={compact ? "size-4" : "size-6"} />
            )}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="min-w-0 truncate text-xs font-medium text-foreground">
            {busy
              ? "Uploading…"
              : isDragActive
                ? "Drop to upload"
                : preview
                  ? compact
                    ? "Replace"
                    : "Drag & drop or click to replace"
                  : compact
                    ? "Add artwork"
                    : "Drag & drop an image, or click to browse"}
          </p>
          {!compact && <p className="truncate text-caption text-muted-foreground">{HINT}</p>}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      {preview && (
        <Dialog open={zoomed} onOpenChange={setZoomed}>
          <DialogContent hideCloseButton className="max-w-2xl p-2 md:max-w-[70dvw]">
            <DialogTitle className="sr-only">Image preview</DialogTitle>

            <img
              src={preview}
              alt="Uploaded image preview"
              className="max-h-[80vh] w-full rounded-card object-contain"
            />
            <DialogClose className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-ring">
              <X aria-hidden className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
