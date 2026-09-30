import { headers } from "next/headers";
import type { Locale } from "next-intl";
import { describeUserAgent } from "@/lib/account/user-agent";
import { authRoutes } from "@/lib/auth/routes";
import { getAuth } from "@/lib/auth/server";
import { requireSession } from "@/lib/auth/session";
import { canSignIn, canUnlink } from "@/lib/system/policy";
import { getAuthPolicy } from "@/lib/system/policy-store";
import { LinkedAccountsCard } from "./linked-accounts-card";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";

/** Reads the session, linked accounts, sessions and policy: streams inside Suspense */
export async function SecuritySections({ locale }: { locale: Locale }) {
  const { session } = await requireSession(locale, authRoutes.accountSecurity);
  const auth = await getAuth();
  const requestHeaders = await headers();
  const [accounts, sessions, policy] = await Promise.all([
    auth.api.listUserAccounts({ headers: requestHeaders }),
    auth.api.listSessions({ headers: requestHeaders }),
    getAuthPolicy(),
  ]);

  const providerIds = accounts.map((account) => account.providerId);
  const hasPassword = providerIds.includes("credential");
  const googleAccount = accounts.find(
    (account) => account.providerId === "google",
  );
  // Better Auth never unlinks the last account; the policy decides the rest
  const canUnlinkGoogle =
    providerIds.length > 1 && canUnlink(policy, providerIds, "google");

  return (
    <>
      {(hasPassword || canSignIn(policy, "emailPassword")) && (
        <PasswordCard
          hasPassword={hasPassword}
          minPasswordLength={policy.emailPassword.minPasswordLength}
        />
      )}
      {(googleAccount || canSignIn(policy, "google")) && (
        <LinkedAccountsCard
          googleAccountId={googleAccount?.accountId}
          canUnlinkGoogle={canUnlinkGoogle}
        />
      )}
      <SessionsCard
        sessions={sessions
          .map((device) => ({
            token: device.token,
            current: device.token === session.token,
            device: describeUserAgent(device.userAgent),
            ipAddress: device.ipAddress,
            lastActive: device.updatedAt,
          }))
          // This device first, then the most recently active
          .sort(
            (a, b) =>
              Number(b.current) - Number(a.current) ||
              b.lastActive.getTime() - a.lastActive.getTime(),
          )}
      />
    </>
  );
}
