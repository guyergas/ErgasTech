import { NextRequest, NextResponse } from "next/server";
import { setReaction, getReactionCounts, getVisitorReaction } from "@/trip/store";
import { nanoid } from "nanoid";

const VISITOR_COOKIE = "trip_visitor";

function getOrSetVisitorId(req: NextRequest, res: NextResponse): string {
  const existing = req.cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;
  const id = nanoid(12);
  res.cookies.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return id;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visitorId = req.cookies.get(VISITOR_COOKIE)?.value ?? "";
  const counts = getReactionCounts(id);
  const mine = visitorId ? getVisitorReaction(id, visitorId) : "";
  return NextResponse.json({ counts, mine });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { emoji } = await req.json();
  const res = NextResponse.json({ ok: true });
  const visitorId = getOrSetVisitorId(req, res);
  setReaction(id, visitorId, emoji ?? "");
  const counts = getReactionCounts(id);
  const mine = getVisitorReaction(id, visitorId);
  return NextResponse.json({ counts, mine }, { headers: res.headers });
}
