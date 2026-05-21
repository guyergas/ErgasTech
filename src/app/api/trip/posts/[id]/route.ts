import { NextRequest, NextResponse } from "next/server";
import { getPost, savePost, deletePost, getReactionCounts, getComments } from "@/trip/store";
import { isAdminRequest } from "@/trip/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const postWithCounts = {
    ...post,
    likes: Object.values(getReactionCounts(id)).reduce((a, b) => a + b, 0),
    comments: getComments(id).length,
  };
  return NextResponse.json(postWithCounts);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const post = getPost(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = { ...post, ...body, id };
  savePost(updated);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  deletePost(id);
  return NextResponse.json({ ok: true });
}
