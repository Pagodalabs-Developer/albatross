import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const AUDIO_EXT_BY_MIME: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/flac": "flac",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "m4a",
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

// UPLOAD_STORAGE=blob writes to Vercel Blob. Auth is picked up by the SDK from env:
// BLOB_STORE_ID + VERCEL_OIDC_TOKEN (injected on Vercel) or a BLOB_READ_WRITE_TOKEN.
// Anything else writes to public/uploads on local disk.
const useBlob = process.env.UPLOAD_STORAGE === "blob";

async function store(file: File, filename: string): Promise<string> {
  if (useBlob) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const isAudio = file.type in AUDIO_EXT_BY_MIME;
  const ext = isAudio ? AUDIO_EXT_BY_MIME[file.type] : IMAGE_EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "A valid image or audio file is required" },
      { status: 400 },
    );
  }

  const limit = isAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return NextResponse.json(
      {
        error: `${isAudio ? "Audio" : "Image"} must be under ${limit / 1024 / 1024} MB`,
      },
      { status: 413 },
    );
  }

  const path = await store(file, `${crypto.randomUUID()}.${ext}`);
  return NextResponse.json({ path }, { status: 201 });
}
