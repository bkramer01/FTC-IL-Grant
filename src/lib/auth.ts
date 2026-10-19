import "server-only";
import { timingSafeEqual, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_USERNAME, SESSION_COOKIE, SESSION_HOURS, signSession, verifySession } from "./session";

/** Constant-time comparison (hashing first makes the lengths equal). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");
  const userOk = safeEqual(username.trim(), ADMIN_USERNAME);
  const passOk = safeEqual(password, expected);
  return userOk && passOk;
}

export async function startSession() {
  const token = await signSession(ADMIN_USERNAME);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentAdmin(): Promise<string | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Server-side guard for every admin page and action (in addition to proxy.ts). */
export async function requireAdmin(): Promise<string> {
  const user = await currentAdmin();
  if (!user) redirect("/login");
  return user;
}

// ---- Login rate limiting (per client IP, in memory) ------------------------
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export function isRateLimited(ip: string, now = Date.now()) {
  const f = failures.get(ip);
  if (!f) return false;
  if (now - f.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return f.count >= MAX_FAILURES;
}

export function recordFailure(ip: string, now = Date.now()) {
  const f = failures.get(ip);
  if (!f || now - f.first > WINDOW_MS) failures.set(ip, { count: 1, first: now });
  else f.count++;
}

export function clearFailures(ip: string) {
  failures.delete(ip);
}
