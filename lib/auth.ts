import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rawCollection } from "@/lib/db";

export const AUTH_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24;

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

const sessions = () => rawCollection("sessions");

export async function createSession(remember = false): Promise<string> {
  const c = await sessions();

  await c.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const token = randomBytes(32).toString("hex");
  await c.insertOne({
    token,
    expiresAt: new Date(Date.now() + sessionMaxAge(remember) * 1000),
  });
  return token;
}

const sessionMaxAge = (remember: boolean) => (remember ? REMEMBER_MAX_AGE : MAX_AGE);

export async function destroySession(): Promise<void> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token) await (await sessions()).deleteOne({ token });
}

export async function isAuthed(): Promise<boolean> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return false;
  const session = await (await sessions()).findOne({ token });

  return !!session && session.expiresAt > new Date();
}

export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthed()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const sessionCookie = (token: string, remember = false) => ({
  name: AUTH_COOKIE,
  value: token,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionMaxAge(remember),
});
