import { NextRequest, NextResponse } from "next/server";
import { makeToken, verifyToken, isAdminEmail, COOKIE_NAME } from "@/trip/auth";

// POST: login with email — issues admin cookie if email is in admin list
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const token = makeToken(email);
  const res = NextResponse.json({ ok: true, isAdmin: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
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
