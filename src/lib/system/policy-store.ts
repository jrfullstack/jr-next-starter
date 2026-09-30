import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { env } from "@/env";
import { db } from "@/lib/db";
import {
  type AuthCapabilities,
  effectivePolicy,
  methodsOfProviders,
  parseAuthPolicy,
  type UserMethodGroup,
} from "./policy";

export const AUTH_POLICY_TAG = "auth-policy";
export const POLICY_ROW_ID = "global";

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

/** What this deployment can offer: Google only with both credentials (validated in src/env.ts) */
export function authCapabilities(): AuthCapabilities {
  return { google: env.GOOGLE_CLIENT_ID !== undefined };
}

/** Policy as saved by the superadmin (what Admin → System edits) */
export async function getStoredAuthPolicy() {
  await connection();
  return readAuthPolicy();
}

/**
 * Policy as it applies, with what the deployment can't offer turned off.
 * Request-time only: it's never baked into a prerendered page.
 */
export async function getAuthPolicy() {
  return effectivePolicy(await getStoredAuthPolicy(), authCapabilities());
}

/** For the safeguards: the methods linked to each superadmin account */
export async function superadminAccessMethods() {
  const superadmins = await db.user.findMany({
    where: { role: "superadmin" },
    select: { accounts: { select: { providerId: true } } },
  });
  return superadmins.map(({ accounts }) =>
    methodsOfProviders(accounts.map(({ providerId }) => providerId)),
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
    methods: methodsOfProviders(providers),
    count,
  }));
}
