import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { can, type Permission } from "./permissions";
import { requireSession } from "./session";

/**
 * Guard for protected pages (server only): signed-out users go to sign-in;
 * signed-in users without the permission get a 404, so the page doesn't reveal it exists.
 */
export async function requirePermission(
  locale: Locale,
  permission: Permission,
  callbackPath: string,
) {
  const session = await requireSession(locale, callbackPath);
  if (!can(session.user.role, permission)) notFound();
  return session;
}
