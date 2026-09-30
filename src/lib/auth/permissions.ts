import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, userAc } from "better-auth/plugins/admin/access";

/**
 * Single source of truth for roles and permissions (docs/plans/auth.md §3).
 * Future panel sections (post, media…) add their actions to `statement`.
 */
const statement = {
  ...defaultStatements,
  // App configuration (auth methods, 2FA policy…): developer only
  system: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
  user: ac.newRole(userAc.statements),
  // Web administration: manages users but can't change roles (no promoting admins) nor impersonate
  admin: ac.newRole({
    user: ["create", "list", "ban", "get", "update"],
    session: ["list", "revoke"],
  }),
  // Developer: every user/session action except impersonation (planned for a later phase)
  superadmin: ac.newRole({
    user: defaultStatements.user.filter(
      (action) => !action.startsWith("impersonate"),
    ),
    session: [...defaultStatements.session],
    system: ["read", "update"],
  }),
};
