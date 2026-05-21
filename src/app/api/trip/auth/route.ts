import { NextRequest, NextResponse } from "next/server";
import { makeToken, verifyToken, isAdminEmail, COOKIE_NAME, getUsers } from "@/trip/auth";

// POST: login with email — issues admin cookie if email is in admin list
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const token = makeToken(email);
  console.log("[AUTH] Login attempt:", email, "Token:", token.substring(0, 20) + "...");
  const res = NextResponse.json({ ok: true, isAdmin: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });
  console.log("[AUTH] Cookie set. Response headers:", res.headers.get('set-cookie'));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  console.log("[AUTH] GET check. Token length:", token.length, "Full token:", token);
  const isAdmin = verifyToken(token);
  console.log("[AUTH] Token verified:", isAdmin);

  // Extract email from token: "admin:email@domain.com:timestamp.signature"
  let userId = 0;
  if (isAdmin && token) {
    const dot = token.lastIndexOf(".");
    if (dot > 0) {
      const payload = token.slice(0, dot);
      console.log("[AUTH] Token payload:", payload);
      const match = payload.match(/^admin:(.+):\d+$/);
      if (match) {
        const email = match[1].toLowerCase();
        console.log("[AUTH] Extracted email:", email);
        const users = getUsers();
        console.log("[AUTH] Available users:", Object.entries(users).map(([id, u]) => `${id}:${u.email}`).join(", "));
        for (const user of Object.values(users)) {
          const userEmailLower = user.email.toLowerCase();
          if (userEmailLower === email) {
            userId = user.id;
            console.log("[AUTH] Found user match! userId:", userId);
            break;
          }
        }
      } else {
        console.log("[AUTH] Payload doesn't match pattern. Payload:", payload);
      }
    }
  }

  console.log("[AUTH] Returning isAdmin:", isAdmin, "userId:", userId);
  return NextResponse.json({ isAdmin, userId });
}
