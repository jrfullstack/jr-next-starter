import { APIError } from "better-auth/api";
import { db } from "@/lib/db";
import { type AuthPolicy, canUnlink } from "@/lib/system/policy";

/**
 * Before /unlink-account: Better Auth only stops unlinking the very last
 * account; this also refuses leaving the user with no method the current
 * policy lets them use (e.g. Google as their only way in).
 */
export async function assertKeepsSignInMethod(
  policy: AuthPolicy,
  userId: string,
  accountId: unknown,
) {
  if (typeof accountId !== "string") return;
  const accounts = await db.account.findMany({
    where: { userId },
    select: { accountId: true, providerId: true },
  });
  const target = accounts.find((account) => account.accountId === accountId);
  if (!target) return;
  const linked = accounts.map((account) => account.providerId);
  if (!canUnlink(policy, linked, target.providerId)) {
    throw new APIError("FORBIDDEN", {
      code: "LAST_SIGN_IN_METHOD",
      message: "This is your only way to sign in",
    });
  }
}
