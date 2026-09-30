import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { type AccessMethod, accessMethods, parseAuthPolicy } from "./policy";

export const AUTH_POLICY_TAG = "auth-policy";
export const POLICY_ROW_ID = "global";

/** Account providerId that each method leaves in the account table */
const methodProviders: Record<AccessMethod, string> = {
  emailPassword: "credential",
};

async function readAuthPolicy() {
  "use cache";
  cacheTag(AUTH_POLICY_TAG);
  // Saving calls updateTag, so this only bounds staleness across server instances
  cacheLife("minutes");
  const row = await db.systemSetting.findUnique({
    where: { id: POLICY_ROW_ID },
  });
  return parseAuthPolicy(row?.policy);
}

/** Current auth policy. Request-time only: it's never baked into a prerendered page. */
export async function getAuthPolicy() {
  await connection();
  return readAuthPolicy();
}

function methodsOf(accounts: { providerId: string }[]) {
  return accessMethods.filter((method) =>
    accounts.some(({ providerId }) => providerId === methodProviders[method]),
  );
}

/** For the safeguards: the methods linked to each superadmin account */
export async function superadminAccessMethods() {
  const superadmins = await db.user.findMany({
    where: { role: "superadmin" },
    select: { accounts: { select: { providerId: true } } },
  });
  return superadmins.map(({ accounts }) => methodsOf(accounts));
}

/** Users who could only sign in with this method (shown before turning it off) */
export function countUsersOnlyWith(method: AccessMethod) {
  const providerId = methodProviders[method];
  return db.user.count({
    where: {
      accounts: { some: { providerId }, every: { providerId } },
    },
  });
}
