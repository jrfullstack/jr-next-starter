import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Redirects `/` to the best matching locale and keeps the locale prefix in every URL
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon.ico, images…)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
