import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  sanitizeStoreLinks,
  sanitizeTracks,
  slugify,
  type Release,
} from "@/lib/types";
import { addItem, getCatalogs } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getCatalogs());
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body.releaseDate || typeof body.releaseDate !== "string") {
    return NextResponse.json({ error: "releaseDate is required" }, { status: 400 });
  }

  const release: Release = {
    slug: slugify(body.title),
    title: body.title.toUpperCase(),
    type: body.type === "Single" ? "Single" : "Album",
    releaseDate: body.releaseDate,
    image: body.image ? String(body.image) : undefined,
    order: Number(body.order) || 0,
    description: String(body.description ?? ""),
    tracks: sanitizeTracks(body.tracks),
    links: sanitizeStoreLinks(body.links),
  };

  const { error } = await addItem("catalogs", release);
  if (error) return NextResponse.json({ error }, { status: 409 });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(`/releases/${release.slug}`);
  return NextResponse.json(release, { status: 201 });
}
