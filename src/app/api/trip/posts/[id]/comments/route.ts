import { NextRequest, NextResponse } from "next/server";
import { getComments, saveComment, deleteComment, getPosts, savePost } from "@/trip/store";
import { isAdminRequest } from "@/trip/auth";
import { nanoid } from "nanoid";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = getComments(id);
  return NextResponse.json(comments.reverse()); // newest first
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authorId, body } = await req.json();
  if (!body?.trim() || !authorId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = {
    id: nanoid(8),
    postId: id,
    authorId: parseInt(authorId),
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  saveComment(comment);

  // increment comment count on the post
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);
  if (post) savePost({ ...post, comments: (post.comments ?? 0) + 1 });

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { commentId } = await req.json();
  deleteComment(commentId);
  return NextResponse.json({ ok: true });
}
