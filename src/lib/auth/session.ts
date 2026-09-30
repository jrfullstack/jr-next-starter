import { headers } from "next/headers";
import type { Locale } from "next-intl";
import { cache } from "react";
import { redirect } from "@/i18n/navigation";
import { authRoutes } from "./routes";
import { getAuth } from "./server";

/** Current session, validated on the server. Cached per request. */
export const getSession = cache(async () => {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
});

/** Session of a protected page; signed-out users are sent to sign-in and come back after */
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
  return session;
}
