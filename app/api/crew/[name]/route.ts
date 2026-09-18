import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  sanitizeHeroSlides,
  sanitizeSocialLinks,
  sanitizeStringList,
  slugify,
} from "@/lib/types";
import { removeItem, updateItem } from "@/lib/db";

type Props = { params: Promise<{ name: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  delete body.name;

  if ("photos" in body) body.photos = sanitizeHeroSlides(body.photos);
  if ("skills" in body) body.skills = sanitizeStringList(body.skills) ?? [];
  if ("credits" in body) body.credits = sanitizeStringList(body.credits) ?? [];
  if ("socials" in body) body.socials = sanitizeSocialLinks(body.socials) ?? [];

  const name = decodeURIComponent((await params).name);
  const { error } = await updateItem("crew", name, body);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/band/${slugify(name)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const name = decodeURIComponent((await params).name);
  const { error } = await removeItem("crew", name);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/band/${slugify(name)}`);
  return NextResponse.json({ ok: true });
}
