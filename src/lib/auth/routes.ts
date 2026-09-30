import type { Locale } from "next-intl";
import { routing } from "@/i18n/routing";

/** Single source of truth for auth-related routes (paths without the locale prefix) */
export const authRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  afterSignIn: "/dashboard",
  accountSecurity: "/account/security",
  twoFactor: "/two-factor",
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

/**
 * Locale of an auth email, read from the callbackURL Better Auth puts in the
 * link (e.g. ...?callbackURL=/en/verify-email). Falls back to the default locale.
 */
export function localeFromAuthUrl(url: string) {
  const callback = new URL(url).searchParams.get("callbackURL") ?? "";
  const { locale } = splitLocale(new URL(callback, url).pathname);
  return locale ?? routing.defaultLocale;
}

/** Absolute app path with locale for Better Auth callbacks, e.g. ("es", "/verify-email") -> "/es/verify-email" */
export function withLocale(locale: Locale, path: string) {
  return `/${locale}${path}`;
}
