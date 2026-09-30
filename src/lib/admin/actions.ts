"use server";

import { can } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { meetsTwoFactor } from "@/lib/system/policy";
import { getAuthPolicy } from "@/lib/system/policy-store";

/**
 * Removes a user's 2FA (lost phone): its secret, backup codes and trusted
 * devices. Admin permission, never on a superadmin, and an admin who must
 * use 2FA needs it set up first (same rule as Better Auth's admin endpoints).
 * Same result shape as the Better Auth client, for the row actions.
 */
export async function removeTwoFactor(userId: string) {
  const forbidden = { error: { status: 403 } };
  const session = await getSession();
  if (!session || !can(session.user.role, { user: ["update"] })) {
    return forbidden;
  }
  const policy = await getAuthPolicy();
  if (!meetsTwoFactor(policy, session.user, session.session)) {
    return forbidden;
  }
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target || target.role === "superadmin" || userId === session.user.id) {
    return forbidden;
  }
  await db.$transaction([
    db.twoFactor.deleteMany({ where: { userId } }),
    db.verification.deleteMany({
      where: { value: userId, identifier: { startsWith: "trust-device-" } },
    }),
    db.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    }),
  ]);
  return { error: null };
}
