import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { db } from "@/lib/db";
import {
  type AccessMethod,
  accessMethods,
  parseAuthPolicy,
  type UserMethodGroup,
} from "./policy";

export const AUTH_POLICY_TAG = "auth-policy";
export const POLICY_ROW_ID = "global";

/** Account providerId that each method leaves in the account table (magic link leaves none) */
const methodProviders: Partial<Record<AccessMethod, string>> = {
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

function methodsOf(providerIds: readonly string[]) {
  return accessMethods.filter((method) =>
    providerIds.some((providerId) => providerId === methodProviders[method]),
  );
}

/** For the safeguards: the methods linked to each superadmin account */
export async function superadminAccessMethods() {
  const superadmins = await db.user.findMany({
    where: { role: "superadmin" },
    select: { accounts: { select: { providerId: true } } },
  });
  return superadmins.map(({ accounts }) =>
    methodsOf(accounts.map(({ providerId }) => providerId)),
  );
}

/**
 * Users grouped by the providers linked to their account, counted in the
 * database (never loads the users). The form uses it to say how many would
 * be left without a way in.
 */
export async function userMethodGroups(): Promise<UserMethodGroup[]> {
  const rows = await db.$queryRaw<{ providers: string[]; count: number }[]>`
    SELECT providers, COUNT(*)::int AS count
    FROM (
      SELECT COALESCE(
        array_agg(DISTINCT a."providerId" ORDER BY a."providerId")
          FILTER (WHERE a."providerId" IS NOT NULL),
        '{}'
      ) AS providers
      FROM "user" u
      LEFT JOIN account a ON a."userId" = u.id
      GROUP BY u.id
    ) linked
    GROUP BY providers
  `;
  return rows.map(({ providers, count }) => ({
    methods: methodsOf(providers),
    count,
  }));
}
