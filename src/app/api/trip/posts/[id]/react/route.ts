import { NextRequest, NextResponse } from "next/server";
import { setReaction, getReactionCounts, getVisitorReaction, setVisitorName, getReactionDetailsForPost } from "@/trip/store";
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
  const details = getReactionDetailsForPost(id);
  const mine = visitorId ? getVisitorReaction(id, visitorId) : "";
  return NextResponse.json({ details, mine });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { emoji, visitorId: incomingVisitorId, visitorName } = await req.json();
  const res = NextResponse.json({ ok: true });

  // Use provided visitorId (numeric or string) or generate a new one for guests
  let visitorId = incomingVisitorId;
  if (!visitorId) {
    visitorId = getOrSetVisitorId(req, res);
  }

  if (visitorName) setVisitorName(visitorId.toString(), visitorName);
  setReaction(id, visitorId.toString(), emoji ?? "");
  const details = getReactionDetailsForPost(id);
  const mine = getVisitorReaction(id, visitorId.toString());
  return NextResponse.json({ details, mine }, { headers: res.headers });
}
