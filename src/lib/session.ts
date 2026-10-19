// Signed admin session cookie. Kept free of Node-only imports so proxy.ts can use it too.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "ftc_grant_session";
export const ADMIN_USERNAME = "FTCAdmin";
export const SESSION_HOURS = 12;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(username: string) {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub === ADMIN_USERNAME ? payload.sub : null;
  } catch {
    return null;
  }
}
