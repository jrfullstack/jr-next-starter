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

/** Providers linked to an account, plus "passkey" when it has any passkey */
function linkedProviders(accounts: { providerId: string }[], passkeys: number) {
  const providers = accounts.map(({ providerId }) => providerId);
  return passkeys > 0 ? [...providers, "passkey"] : providers;
}

/** For the safeguards: the methods linked to each superadmin account */
export async function superadminAccessMethods() {
  const superadmins = await db.user.findMany({
    where: { role: "superadmin" },
    select: {
      accounts: { select: { providerId: true } },
      _count: { select: { passkeys: true } },
    },
  });
  return superadmins.map(({ accounts, _count }) =>
    methodsOfProviders(linkedProviders(accounts, _count.passkeys)),
  );
}

/**
 * Users grouped by the providers linked to their account (passkeys count as
 * one), counted in the database (never loads the users). The form uses it to
 * say how many would be left without a way in.
 */
export async function userMethodGroups(): Promise<UserMethodGroup[]> {
  const rows = await db.$queryRaw<{ providers: string[]; count: number }[]>`
    SELECT providers, COUNT(*)::int AS count
    FROM (
      SELECT ARRAY(
        SELECT DISTINCT linked.provider FROM (
          SELECT a."providerId" AS provider FROM account a WHERE a."userId" = u.id
          UNION
          SELECT 'passkey' FROM passkey p WHERE p."userId" = u.id
        ) linked
        ORDER BY linked.provider
      ) AS providers
      FROM "user" u
    ) grouped
    GROUP BY providers
  `;
  return rows.map(({ providers, count }) => ({
    methods: methodsOfProviders(providers),
    count,
  }));
}
