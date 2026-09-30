import { APIError } from "better-auth/api";
import { db } from "@/lib/db";
import { type AuthPolicy, canUnlink } from "@/lib/system/policy";

/** What a request removes: a linked account (Google…) or one passkey */
type Removal = { accountId: unknown } | { passkeyId: unknown };

/** The provider that disappears, or undefined if the user keeps it */
function removedProvider(
  removal: Removal,
  accounts: { accountId: string; providerId: string }[],
  passkeys: number,
) {
  if ("passkeyId" in removal) {
    // With another passkey left, "has a passkey" stays true
    return passkeys === 1 ? "passkey" : undefined;
  }
  return accounts.find((account) => account.accountId === removal.accountId)
    ?.providerId;
}

/**
 * Before /unlink-account and /passkey/delete-passkey: Better Auth only stops
 * unlinking the very last account; this also refuses leaving the user with
 * no method the current policy lets them use (e.g. their only passkey).
 */
export async function assertKeepsSignInMethod(
  policy: AuthPolicy,
  userId: string,
  removal: Removal,
) {
  const [accounts, passkeys] = await Promise.all([
    db.account.findMany({
      where: { userId },
      select: { accountId: true, providerId: true },
    }),
    db.passkey.count({ where: { userId } }),
  ]);
  const provider = removedProvider(removal, accounts, passkeys);
  if (!provider) return;
  const linked = accounts.map((account) => account.providerId);
  if (passkeys > 0) linked.push("passkey");
  if (!canUnlink(policy, linked, provider)) {
    throw new APIError("FORBIDDEN", {
      code: "LAST_SIGN_IN_METHOD",
      message: "This is your only way to sign in",
    });
  }
}
