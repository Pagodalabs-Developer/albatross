import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sanitizeHeroSlides } from "@/lib/types";
import { getNewsItem, removeItem, updateItem } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const item = await getNewsItem((await params).slug);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  delete body.slug;
  if ("photos" in body) body.photos = sanitizeHeroSlides(body.photos);
  if (body.title) body.title = String(body.title).toUpperCase();

  const slug = (await params).slug;
  const { error } = await updateItem("news", slug, body);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const slug = (await params).slug;
  const { error } = await removeItem("news", slug);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  return NextResponse.json({ ok: true });
}
