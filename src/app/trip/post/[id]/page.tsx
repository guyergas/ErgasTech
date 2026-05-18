import { notFound } from "next/navigation";
import { getPost, getComments, getReactionCounts } from "@/trip/store";
import { family } from "@/trip/data";
import PostDetail from "./PostDetail";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();

  const comments = getComments(id).reverse(); // newest first
  const reactionCounts = getReactionCounts(id);
  const m = family[post.authorId] || family.dad;

  return <PostDetail post={post} comments={comments} reactionCounts={reactionCounts} member={m} />;
}
