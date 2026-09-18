import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  sanitizeHeroSlides,
  sanitizeSocialLinks,
  sanitizeStringList,
  slugify,
  type Member,
} from "@/lib/types";
import { addItem, getCrew } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getCrew());
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const member: Member = {
    name: body.name,
    role: String(body.role ?? ""),
    image: String(body.image ?? ""),
    order: Number(body.order) || 0,
    about: String(body.about ?? ""),
    photos: sanitizeHeroSlides(body.photos),
    joined: body.joined ? String(body.joined) : undefined,
    skills: sanitizeStringList(body.skills),
    credits: sanitizeStringList(body.credits),
    socials: sanitizeSocialLinks(body.socials),
  };

  const { error } = await addItem("crew", member);
  if (error) return NextResponse.json({ error }, { status: 409 });

  revalidatePath("/");
  revalidatePath(`/band/${slugify(member.name)}`);
  return NextResponse.json(member, { status: 201 });
}
