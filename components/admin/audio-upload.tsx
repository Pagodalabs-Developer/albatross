"use client";
import { AudioLines, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";

type AudioUploadProps = {
  defaultValue?: string;

  onChange: (path: string, duration?: number) => void;
  label?: string;
};

function probeDuration(src: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const probe = new Audio();
    const done = (value?: number) => resolve(value);
    probe.addEventListener("loadedmetadata", () =>
      done(Number.isFinite(probe.duration) && probe.duration > 0 ? probe.duration : undefined),
    );
    probe.addEventListener("error", () => done(undefined));

    setTimeout(() => done(undefined), 8000);
    probe.preload = "metadata";
    probe.src = src;
  });
}

function readDuration(file: File): Promise<number | undefined> {
  const url = URL.createObjectURL(file);
  return probeDuration(url).finally(() => URL.revokeObjectURL(url));
}

function sourceLabel(path: string): string {
  if (!/^https?:\/\//.test(path)) return decodeURIComponent(path.split("/").pop() ?? path);
  try {
    return new URL(path).hostname;
  } catch {
    return path;
  }
}

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = {
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/ogg": [".ogg"],
  "audio/flac": [".flac"],
  "audio/mp4": [".m4a"],
};

export function AudioUpload({ defaultValue, onChange, label = "audio" }: AudioUploadProps) {
  const [path, setPath] = useState(defaultValue ?? "");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState("");

  const applyUrl = async () => {
    const value = url.trim();
    if (!/^https?:\/\/\S+$/.test(value)) {
      setError("Enter a full https:// link to an audio file");
      return;
    }
    setError("");
    setProbing(true);

    const duration = await probeDuration(value);
    setProbing(false);
    setPath(value);
    setUrl("");
    onChange(value, duration);
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setBusy(true);
      setError("");
      const formData = new FormData();
      formData.set("file", file);
      try {
        const [res, duration] = await Promise.all([
          fetch("/api/upload", { method: "POST", body: formData }),
          readDuration(file),
        ]);
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error);
        const uploaded = (await res.json()).path as string;
        setPath(uploaded);
        onChange(uploaded, duration);
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const onDropRejected = useCallback(([rejection]: FileRejection[]) => {
    const code = rejection?.errors[0]?.code;
    setError(
      code === "file-too-large"
        ? "Audio must be under 25 MB"
        : code === "file-invalid-type"
          ? "Use an MP3, WAV, OGG, FLAC or M4A"
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

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div
        {...getRootProps()}
        className={`flex min-w-0 items-center gap-3 rounded-card border border-dashed p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          busy ? "cursor-progress" : "cursor-pointer"
        } ${
          isDragReject || error
            ? "border-destructive bg-destructive/5"
            : isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:border-brand"
        }`}
      >
        <input {...getInputProps()} />
        <span
          aria-hidden
          className={`flex size-10 shrink-0 items-center justify-center rounded-button ${
            path ? "bg-primary/10 text-brand" : "bg-muted text-muted-foreground"
          }`}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <AudioLines className="size-4" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="min-w-0 truncate text-xs font-medium text-foreground">
            {busy
              ? "Uploading…"
              : isDragActive
                ? "Drop to upload"
                : path
                  ? sourceLabel(path)
                  : `Add ${label} (MP3, WAV, M4A · up to 25 MB)`}
          </p>
          {path && !busy && !isDragActive && (
            <p className="truncate text-caption text-muted-foreground">
              MP3, WAV, M4A · up to 25 MB
            </p>
          )}
        </div>

        {path && !busy && (
          <span className="flex shrink-0 items-center gap-1 rounded-button border border-border px-2.5 py-1.5 text-caption font-semibold text-foreground transition-colors hover:border-brand">
            REPLACE
          </span>
        )}
        {path && !busy && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              setPath("");
              setError("");
              onChange("");
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        )}
      </div>

      {!busy && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder={
              path
                ? "…or replace with a direct audio link (https://)"
                : "…or paste a direct audio link (https://)"
            }
            aria-label={`${label} URL`}
            className="min-w-0 flex-1 rounded-button border border-input bg-surface px-2.5 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!url.trim() || probing}
            className="flex shrink-0 items-center gap-1.5 rounded-button border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {probing && <Loader2 aria-hidden className="size-3 animate-spin" />}
            USE LINK
          </button>
        </div>
      )}

      {path && !busy && (
        <audio src={path} controls preload="none" className="h-8 w-full" />
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
