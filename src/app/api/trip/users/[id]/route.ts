import { NextRequest, NextResponse } from "next/server";
import { getUser, saveUser, verifyToken, COOKIE_NAME, getUsers } from "@/trip/auth";

export async function GET(req: NextRequest, { params }: any) {
  const userId = parseInt(params.id);
  const user = getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: any) {
  const userId = parseInt(params.id);
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const isAdmin = verifyToken(token);

  if (!isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  // Extract userId from token to verify they can only edit their own profile
  let tokenUserId = 0;
  if (token) {
    const parts = token.split(".");
    if (parts[0]) {
      const payload = parts[0];
      const match = payload.match(/^admin:(.+):\d+$/);
      if (match) {
        const email = match[1];
        const users = getUsers();
        for (const user of Object.values(users)) {
          if (user.email === email) {
            tokenUserId = user.id;
            break;
          }
        }
      }
    }
  }

  if (tokenUserId !== userId) {
    return NextResponse.json({ error: "Can only edit your own profile" }, { status: 403 });
  }

  const user = getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { name, photoUrl } = await req.json();
  if (name) user.name = name;
  if (photoUrl !== undefined) user.photoUrl = photoUrl;

  saveUser(user);
  return NextResponse.json(user);
}
