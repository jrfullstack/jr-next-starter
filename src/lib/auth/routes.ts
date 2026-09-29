import { routing } from "@/i18n/routing";

/** Single source of truth for auth-related routes (paths without the locale prefix) */
export const authRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  afterSignIn: "/dashboard",
  /** Require a session; the real check happens in each page on the server */
  protected: ["/dashboard", "/account", "/admin"],
} as const;

/** Splits "/es/dashboard" into { locale: "es", path: "/dashboard" } */
export function splitLocale(pathname: string) {
  const [, first = "", ...rest] = pathname.split("/");
  const locale = routing.locales.find((cur) => cur === first);
  if (!locale) return { locale: undefined, path: pathname };
  return { locale, path: `/${rest.join("/")}` };
}

export function isProtectedPath(path: string) {
  return authRoutes.protected.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Only same-site relative paths are accepted as redirect targets after sign-in
 * (prevents open redirects like ?callbackUrl=https://evil.com or //evil.com)
 */
export function safeCallbackPath(value: string | undefined) {
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  return authRoutes.afterSignIn;
}
