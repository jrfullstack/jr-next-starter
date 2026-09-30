import { describe, expect, it } from "vitest";
import { roles } from "./permissions";

// Role rules from docs/plans/auth.md §3
describe("roles", () => {
  it("admin manages users but can't change roles or impersonate", () => {
    expect(roles.admin.authorize({ user: ["list", "ban"] }).success).toBe(true);
    expect(roles.admin.authorize({ user: ["set-role"] }).success).toBe(false);
    expect(roles.admin.authorize({ user: ["impersonate"] }).success).toBe(
      false,
    );
  });

  it("only superadmin can change the app configuration", () => {
    expect(roles.superadmin.authorize({ system: ["update"] }).success).toBe(
      true,
    );
    expect(roles.admin.authorize({ system: ["read"] }).success).toBe(false);
    expect(roles.user.authorize({ system: ["read"] }).success).toBe(false);
  });

  it("impersonation is not granted to anyone yet", () => {
    for (const role of Object.values(roles)) {
      expect(role.authorize({ user: ["impersonate"] }).success).toBe(false);
    }
  });
});
