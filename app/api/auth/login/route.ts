import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, sessionCookie } from "@/lib/auth";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const { username, password, remember } = await request
    .json()
    .catch(() => ({ username: "", password: "", remember: false }));

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { error: "Admin credentials not configured (.env.local)" },
      { status: 500 },
    );
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !safeEqual(username, expectedUser) ||
    !safeEqual(password, expectedPass)
  ) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const stayLoggedIn = remember === true;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(await createSession(stayLoggedIn), stayLoggedIn));
  return response;
}
