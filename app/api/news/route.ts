import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sanitizeHeroSlides, slugify, type NewsItem } from "@/lib/types";
import { addItem, getNewsItems } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getNewsItems());
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const item: NewsItem = {
    slug: slugify(body.title),
    title: body.title.toUpperCase(),
    teaser: String(body.teaser ?? "Latest from Albatross"),
    date: body.date ? String(body.date) : undefined,
    videoUrl: body.videoUrl ? String(body.videoUrl) : undefined,
    image: body.image ? String(body.image) : undefined,
    order: Number(body.order) || 0,
    body: String(body.body ?? ""),
    quote: body.quote ? String(body.quote) : undefined,
    quoteBy: body.quoteBy ? String(body.quoteBy) : undefined,
    photos: sanitizeHeroSlides(body.photos),
  };

  const { error } = await addItem("news", item);
  if (error) return NextResponse.json({ error }, { status: 409 });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${item.slug}`);
  return NextResponse.json(item, { status: 201 });
}
