import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Paths anyone may open. Every other page requires the admin session.
const PUBLIC_PATHS = [/^\/login\/?$/, /^\/logo\.svg$/, /^\/favicon\.ico$/, /^\/robots\.txt$/];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((re) => re.test(pathname))) return NextResponse.next();

  const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (user) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
