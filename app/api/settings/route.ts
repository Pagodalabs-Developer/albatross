import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/rich-text";
import {
  DEFAULT_STORY_HEADING,
  isMediaPath,
  sanitizeEmail,
  sanitizeHeroSlides,
} from "@/lib/types";
import { getSiteSettings, setSiteSettings } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (typeof body?.mission !== "string") {
    return NextResponse.json({ error: "mission is required" }, { status: 400 });
  }

  const settings = {
    mission: body.mission,
    heroImages: sanitizeHeroSlides(body.heroImages),

    storyHeading: String(body.storyHeading ?? "").trim() || DEFAULT_STORY_HEADING,
    story: sanitizeRichText(String(body.story ?? "")),
    storyImage: isMediaPath(body.storyImage) ? body.storyImage : undefined,

    contactEmail: sanitizeEmail(body.contactEmail),
  };
  await setSiteSettings(settings);

  revalidatePath("/");
  return NextResponse.json(settings);
}
