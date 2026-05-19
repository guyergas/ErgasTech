import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { User } from "./store";
import { getUsers as getStoreUsers, saveUser as saveStoreUser } from "./store";

export const COOKIE_NAME = "trip_admin";

const SECRET = process.env.TRIP_AUTH_SECRET ?? "ergastrip-secret-2026";

// Admin emails — comma-separated in env, or hardcoded fallback
export function getAdminEmails(): string[] {
  const env = process.env.TRIP_ADMIN_EMAILS ?? "";
  if (env) return env.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  return ["guyergas@gmail.com", "yedikla@gmail.com", "ofirergas@gmail.com", "ergasayala@gmail.com", "omerergas@gmail.com", "idoergas@gmail.com"];
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

function sign(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash + payload.charCodeAt(i) * SECRET.charCodeAt(i % SECRET.length)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function makeToken(email: string): string {
  const payload = `admin:${email}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  return sig === sign(payload) && payload.startsWith("admin:");
}

export async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value ?? "";
    return verifyToken(token);
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  return verifyToken(token);
}

export function getUser(userId: number): User | null {
  const users = getStoreUsers();
  return users[userId] ?? null;
}

export function saveUser(user: User): void {
  saveStoreUser(user);
}

export function getUsers(): Record<number, User> {
  return getStoreUsers();
}
