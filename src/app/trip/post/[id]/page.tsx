import { notFound } from "next/navigation";
import { getPost, getComments, getReactionDetailsForPost } from "@/trip/store";
import { family } from "@/trip/data";
import PostDetail from "./PostDetail";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();

  const comments = getComments(id).reverse(); // newest first
  const details = getReactionDetailsForPost(id);
  const m = family[post.authorId] || family.guyergas;

  return <PostDetail post={post} comments={comments} details={details} member={m} />;
}
