import { NextRequest, NextResponse } from "next/server";
import { getPosts, savePost } from "@/trip/store";
import { isAdminRequest } from "@/trip/auth";
import { posts as seedPosts } from "@/trip/data";
import { nanoid } from "nanoid";

// Seed once if store is empty
function ensureSeeded() {
  const stored = getPosts();
  if (stored.length === 0) {
    for (const p of seedPosts) savePost(p);
  }
}

export async function GET() {
  ensureSeeded();
  const posts = getPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const now = new Date().toISOString();
  const id = nanoid(8);

  const post = {
    id,
    slug: id,
    title: body.title ?? "",
    authorId: body.authorId ?? "dad",
    postType: body.postType ?? "text",
    layout: body.layout ?? "standard",
    rawText: body.rawText ?? "",
    improvedText: body.improvedText ?? undefined,
    selectedTextVersion: body.selectedTextVersion ?? "raw",
    locationName: body.locationName ?? "",
    country: body.country ?? "תאילנד",
    city: body.city ?? "",
    lat: body.lat,
    lng: body.lng,
    locationPrecision: "general" as const,
    photo: body.photo ?? undefined,
    extras: body.extras ?? undefined,
    audioUrl: body.audioUrl ?? undefined,
    transcriptRaw: body.transcriptRaw ?? undefined,
    transcriptImproved: body.transcriptImproved ?? undefined,
    voiceLen: body.voiceLen ?? undefined,
    day: body.day ?? 1,
    date: body.date ?? new Date().toLocaleDateString("he-IL"),
    publishedAt: now,
    visibility: "public" as const,
    likes: 0,
    comments: 0,
    aiImproved: !!body.improvedText,
  };

  savePost(post);
  return NextResponse.json(post, { status: 201 });
}
