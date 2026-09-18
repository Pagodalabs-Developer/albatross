import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { removeItem, updateItem } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  delete body.slug;

  const { error } = await updateItem("gallery", (await params).slug, body);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { error } = await removeItem("gallery", (await params).slug);
  if (error) return NextResponse.json({ error }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json({ ok: true });
}
