import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  parseCoords,
  sanitizeHeroSlides,
  sanitizeLineup,
  sanitizeStringList,
  sanitizeTickets,
} from "@/lib/types";
import { getEvent, removeItem, updateItem } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(event);
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
  if ("tickets" in body) body.tickets = sanitizeTickets(body.tickets) ?? [];
  if ("lineup" in body) body.lineup = sanitizeLineup(body.lineup) ?? [];
  if ("info" in body) body.info = sanitizeStringList(body.info) ?? [];
  if ("photos" in body) body.photos = sanitizeHeroSlides(body.photos);

  if ("coords" in body) body.coords = parseCoords(body.coords) ?? "";

  const slug = (await params).slug;
  const { error } = await updateItem("events", slug, body);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/events/${slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const slug = (await params).slug;
  const { error } = await removeItem("events", slug);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/events/${slug}`);
  return NextResponse.json({ ok: true });
}
