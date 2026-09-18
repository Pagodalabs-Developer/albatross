import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  parseCoords,
  sanitizeHeroSlides,
  sanitizeLineup,
  sanitizeStringList,
  sanitizeTickets,
  slugify,
  type BandEvent,
} from "@/lib/types";
import { addItem, getEvents } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getEvents());
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const event: BandEvent = {
    slug: slugify(body.title),
    title: body.title.toUpperCase(),

    date: body.date ? String(body.date) : undefined,
    tickets: sanitizeTickets(body.tickets),
    venue: String(body.venue ?? "TBA"),
    city: String(body.city ?? "Nepal"),

    coords: parseCoords(body.coords),
    image: body.image ? String(body.image) : undefined,
    order: Number(body.order) || 0,
    about: String(body.about ?? ""),
    lineup: sanitizeLineup(body.lineup),
    info: sanitizeStringList(body.info),
    photos: sanitizeHeroSlides(body.photos),
  };

  const { error } = await addItem("events", event);
  if (error) return NextResponse.json({ error }, { status: 409 });

  revalidatePath("/");
  revalidatePath(`/events/${event.slug}`);
  return NextResponse.json(event, { status: 201 });
}
