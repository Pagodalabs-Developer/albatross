import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sanitizeStoreLinks, sanitizeTracks } from "@/lib/types";
import { getCatalog, removeItem, updateItem } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const release = await getCatalog((await params).slug);
  if (!release) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(release);
}

export async function PATCH(request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  delete body.slug;
  if (body.title) body.title = String(body.title).toUpperCase();
  if ("links" in body) body.links = sanitizeStoreLinks(body.links) ?? [];
  if ("tracks" in body) body.tracks = sanitizeTracks(body.tracks) ?? [];

  const slug = (await params).slug;
  const { error } = await updateItem("catalogs", slug, body);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(`/releases/${slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const slug = (await params).slug;
  const { error } = await removeItem("catalogs", slug);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(`/releases/${slug}`);
  return NextResponse.json({ ok: true });
}
