import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { authRoutes, isProtectedPath, splitLocale } from "./lib/auth/routes";

// Redirects `/` to the best matching locale and keeps the locale prefix in every URL
const intlMiddleware = createMiddleware(routing);

/**
 * Optimistic check: only looks for the session cookie (no DB call) to redirect
 * signed-out users early. Pages still validate the session on the server.
 */
function redirectIfSignedOut(request: NextRequest) {
  const { locale, path } = splitLocale(request.nextUrl.pathname);
  if (!locale || !isProtectedPath(path) || getSessionCookie(request)) {
    return null;
  }
  const signInUrl = new URL(`/${locale}${authRoutes.signIn}`, request.url);
  signInUrl.searchParams.set("callbackUrl", path);
  return NextResponse.redirect(signInUrl);
}

export default function proxy(request: NextRequest) {
  return redirectIfSignedOut(request) ?? intlMiddleware(request);
}

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon.ico, images…)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
