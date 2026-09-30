import { APIError } from "better-auth/api";
import { env } from "@/env";
import { db } from "@/lib/db";

type RoleCandidate = {
  email: string;
  emailVerified: boolean;
  role?: string | null;
};

/**
 * `superadmin` is computed, never granted: email listed in SUPER_ADMIN_EMAILS
 * AND verified (docs/plans/auth.md §3).
 */
export function isSuperadmin(
  user: Omit<RoleCandidate, "role">,
  superAdminEmails: readonly string[] = env.SUPER_ADMIN_EMAILS,
) {
  return (
    user.emailVerified && superAdminEmails.includes(user.email.toLowerCase())
  );
}

/** Role the user must switch to, or null if it's already right */
export function superadminRoleChange(
  user: RoleCandidate,
  superAdminEmails: readonly string[] = env.SUPER_ADMIN_EMAILS,
) {
  const qualifies = isSuperadmin(user, superAdminEmails);
  if (qualifies && user.role !== "superadmin") return "superadmin";
  // Removed from the list (or unverified): back to a regular user
  if (!qualifies && user.role === "superadmin") return "user";
  return null;
}

/** Recomputes the role on every sign-in, so removing an email revokes the role */
export async function syncSuperadminRole(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const role = superadminRoleChange(user);
  if (role) await db.user.update({ where: { id: userId }, data: { role } });
}

/** Nobody can assign `superadmin` through the API: it only comes from SUPER_ADMIN_EMAILS */
export function assertAssignableRole(role: unknown) {
  const roles = Array.isArray(role) ? role : [role];
  if (roles.includes("superadmin")) {
    throw new APIError("FORBIDDEN", {
      message: "The superadmin role can't be assigned",
    });
  }
}

/** Admin endpoints that act on another user through body.userId */
const userTargetPaths = new Set([
  "/admin/set-role",
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/list-user-sessions",
  "/admin/revoke-user-sessions",
  "/admin/remove-user",
  "/admin/set-user-password",
  "/admin/update-user",
  "/admin/impersonate-user",
]);

/** Nobody can manage a superadmin through the API, not even another superadmin */
export async function assertNotSuperadminTarget(path: string, userId: unknown) {
  if (!userTargetPaths.has(path) || typeof userId !== "string") return;
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (target?.role === "superadmin") {
    throw new APIError("FORBIDDEN", {
      message: "Superadmin accounts can't be managed",
    });
  }
}
