"use server";

import { updateTag } from "next/cache";
import { can } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  authPolicySchema,
  effectivePolicy,
  parseAuthPolicy,
  policyChanges,
  policyViolations,
} from "./policy";
import {
  AUTH_POLICY_TAG,
  authCapabilities,
  POLICY_ROW_ID,
  superadminAccessMethods,
} from "./policy-store";

export type SaveAuthPolicyResult =
  | { ok: true }
  | { ok: false; error: "forbidden" | "invalid" | "unsafe" };

/**
 * Saves the auth policy from Admin → System. Everything the page checks is
 * checked again here: permission, values and safeguards.
 */
export async function saveAuthPolicy(
  input: unknown,
): Promise<SaveAuthPolicyResult> {
  const session = await getSession();
  if (!session || !can(session.user.role, { system: ["update"] })) {
    return { ok: false, error: "forbidden" };
  }
  const parsed = authPolicySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const after = parsed.data;
  const applied = effectivePolicy(after, authCapabilities());
  if (policyViolations(applied, await superadminAccessMethods()).length > 0) {
    return { ok: false, error: "unsafe" };
  }

  const row = await db.systemSetting.findUnique({
    where: { id: POLICY_ROW_ID },
  });
  const before = parseAuthPolicy(row?.policy);
  if (policyChanges(before, after).length === 0) return { ok: true };

  const { id: actorId, email: actorEmail } = session.user;
  await db.$transaction([
    db.systemSetting.upsert({
      where: { id: POLICY_ROW_ID },
      create: { id: POLICY_ROW_ID, policy: after, updatedById: actorId },
      update: { policy: after, updatedById: actorId },
    }),
    db.systemAuditLog.create({
      data: { actorId, actorEmail, before, after },
    }),
  ]);
  // Read-your-writes here; other server instances catch up within the cache lifetime
  updateTag(AUTH_POLICY_TAG);
  return { ok: true };
}
