import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { slugify, type GalleryImage } from "@/lib/types";
import { addItem, getGalleryImages } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getGalleryImages());
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body?.image || typeof body.image !== "string") {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }

  const item: GalleryImage = {
    slug: slugify(body.title),
    title: body.title,
    description: String(body.description ?? ""),
    image: body.image,
    order: Number(body.order) || 0,
  };

  const { error } = await addItem("gallery", item);
  if (error) return NextResponse.json({ error }, { status: 409 });

  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json(item, { status: 201 });
}
