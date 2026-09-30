// @vitest-environment node
// Node environment: server-only env vars are blocked by T3-env in jsdom
import { describe, expect, it } from "vitest";
import {
  assertAssignableRole,
  isSuperadmin,
  superadminRoleChange,
} from "./superadmin";

const developerEmails = ["dev@example.com"];
const dev = { email: "Dev@Example.com", emailVerified: true };

// docs/plans/auth.md §3: superadmin is computed, never granted
describe("superadmin", () => {
  it("requires a listed email that is verified", () => {
    expect(isSuperadmin(dev, developerEmails)).toBe(true);
    expect(
      isSuperadmin({ ...dev, emailVerified: false }, developerEmails),
    ).toBe(false);
    expect(
      isSuperadmin({ ...dev, email: "other@example.com" }, developerEmails),
    ).toBe(false);
  });

  it.each([
    ["promotes a verified listed user", { ...dev, role: "user" }, "superadmin"],
    ["keeps an existing superadmin", { ...dev, role: "superadmin" }, null],
    [
      "demotes a superadmin removed from the list",
      { ...dev, email: "old@example.com", role: "superadmin" },
      "user",
    ],
    [
      "leaves other roles alone",
      { email: "admin@example.com", emailVerified: true, role: "admin" },
      null,
    ],
  ])("%s", (_case, user, expected) => {
    expect(superadminRoleChange(user, developerEmails)).toBe(expected);
  });

  it("can't be assigned through the API", () => {
    expect(() => assertAssignableRole("superadmin")).toThrow();
    expect(() => assertAssignableRole(["admin", "superadmin"])).toThrow();
    expect(() => assertAssignableRole("admin")).not.toThrow();
  });
});
