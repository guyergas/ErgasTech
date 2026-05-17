// Admin auth helpers — PIN-based with signed cookie

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "trip_admin";
const PIN = process.env.TRIP_ADMIN_PIN ?? "123456";

// Simple HMAC-like signature using the PIN itself as secret
// Not cryptographically perfect but sufficient for a family app
function sign(value: string): string {
  // XOR-based simple checksum with PIN
  let hash = 0;
  const secret = PIN + "ergastrip";
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i) * secret.charCodeAt(i % secret.length)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function makeToken(): string {
  const payload = `admin:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  return sig === sign(payload) && payload.startsWith("admin:");
}

// For use in Server Components / Route Handlers
export async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value ?? "";
    return verifyToken(token);
  } catch {
    return false;
  }
}

// For use in API route handlers (NextRequest)
export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  return verifyToken(token);
}

export { COOKIE_NAME };
