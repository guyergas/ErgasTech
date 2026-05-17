import { NextRequest, NextResponse } from "next/server";
import { makeToken, verifyToken, COOKIE_NAME } from "@/trip/auth";

const PIN = process.env.TRIP_ADMIN_PIN ?? "123456";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (pin !== PIN) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }
  const token = makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  return NextResponse.json({ isAdmin: verifyToken(token) });
}
