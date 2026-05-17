// Server-side JSON file store for trip data
// All functions are safe to call from API routes (Node.js only)

import fs from "fs";
import path from "path";
import type { TripPost } from "./data";

const DATA_DIR = process.env.TRIP_DATA_DIR || path.join(process.cwd(), "data", "trip");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJson<T>(name: string, fallback: T): T {
  ensureDir();
  try {
    const raw = fs.readFileSync(filePath(name), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(name: string, data: T): void {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ─── Posts ────────────────────────────────────────────────────

export function getPosts(): TripPost[] {
  return readJson<TripPost[]>("posts", []);
}

export function getPost(id: string): TripPost | null {
  return getPosts().find((p) => p.id === id) ?? null;
}

export function savePost(post: TripPost): void {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post); // newest first
  writeJson("posts", posts);
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id);
  writeJson("posts", posts);
}

// ─── Reactions ────────────────────────────────────────────────
// Structure: { [postId]: { [visitorId]: emoji } }

type ReactionsStore = Record<string, Record<string, string>>;

export function getReactions(): ReactionsStore {
  return readJson<ReactionsStore>("reactions", {});
}

export function setReaction(postId: string, visitorId: string, emoji: string): void {
  const store = getReactions();
  if (!store[postId]) store[postId] = {};
  if (emoji === "") {
    delete store[postId][visitorId];
  } else {
    store[postId][visitorId] = emoji;
  }
  writeJson("reactions", store);
}

export function getReactionCounts(postId: string): Record<string, number> {
  const store = getReactions();
  const postReactions = store[postId] ?? {};
  const counts: Record<string, number> = {};
  for (const emoji of Object.values(postReactions)) {
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  }
  return counts;
}

export function getVisitorReaction(postId: string, visitorId: string): string {
  return getReactions()[postId]?.[visitorId] ?? "";
}

// ─── Comments ────────────────────────────────────────────────
// Structure: Comment[]

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  familyMemberId?: string; // set if posted by family (admin cookie)
  body: string;
  createdAt: string;
  deletedAt?: string;
}

export function getComments(postId?: string): Comment[] {
  const all = readJson<Comment[]>("comments", []);
  if (postId) return all.filter((c) => c.postId === postId && !c.deletedAt);
  return all.filter((c) => !c.deletedAt);
}

export function saveComment(comment: Comment): void {
  const all = readJson<Comment[]>("comments", []);
  all.push(comment);
  writeJson("comments", all);
}

export function deleteComment(id: string): void {
  const all = readJson<Comment[]>("comments", []);
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) all[idx].deletedAt = new Date().toISOString();
  writeJson("comments", all);
}
