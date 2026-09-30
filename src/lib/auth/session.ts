import { headers } from "next/headers";
import type { Locale } from "next-intl";
import { cache } from "react";
import { redirect } from "@/i18n/navigation";
import { twoFactorRequired } from "@/lib/system/policy";
import { getAuthPolicy } from "@/lib/system/policy-store";
import { authRoutes } from "./routes";
import { getAuth } from "./server";

/** Current session, validated on the server. Cached per request. */
export const getSession = cache(async () => {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Session of a protected page; signed-out users are sent to sign-in and come
 * back after. When the policy requires 2FA for this user and it isn't set up,
 * the only page they can open is Account → Security, to set it up.
 */
export async function requireSession(locale: Locale, callbackPath: string) {
  const session = await getSession();
  if (!session) {
    return redirect({
      href: {
        pathname: authRoutes.signIn,
        query: { callbackUrl: callbackPath },
      },
      locale,
    });
  }
  const policy = await getAuthPolicy();
  if (
    callbackPath !== authRoutes.accountSecurity &&
    twoFactorRequired(policy, session.user.role) &&
    !session.user.twoFactorEnabled
  ) {
    return redirect({
      href: { pathname: authRoutes.accountSecurity, query: { setup: "2fa" } },
      locale,
    });
  }
  return session;
}
