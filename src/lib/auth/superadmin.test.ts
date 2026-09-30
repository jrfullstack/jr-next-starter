// @vitest-environment node
// Node environment: server-only env vars are blocked by T3-env in jsdom
import { describe, expect, it, vi } from "vitest";
import {
  assertAssignableRole,
  assertNotSuperadminTarget,
  assertSafeAdminUserInput,
  isSuperadmin,
  superadminRoleChange,
} from "./superadmin";

// The target's role, as the database would return it
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve({
          role: where.id === "super-1" ? "superadmin" : "user",
        }),
    },
  },
}));

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

describe("assertNotSuperadminTarget", () => {
  it("rejects any admin action on a superadmin account", async () => {
    await expect(
      assertNotSuperadminTarget("/admin/ban-user", "super-1"),
    ).rejects.toThrow();
    await expect(
      assertNotSuperadminTarget("/admin/set-role", "super-1"),
    ).rejects.toThrow();
  });

  it("allows actions on other users and ignores unrelated endpoints", async () => {
    await expect(
      assertNotSuperadminTarget("/admin/ban-user", "user-1"),
    ).resolves.toBeUndefined();
    await expect(
      assertNotSuperadminTarget("/sign-in/email", "super-1"),
    ).resolves.toBeUndefined();
  });
});

describe("assertSafeAdminUserInput", () => {
  const listed = ["dev@example.com"];

  it.each([
    ["/admin/create-user", { email: "DEV@example.com" }],
    ["/admin/create-user", { email: "a@b.com", data: { emailVerified: true } }],
    ["/admin/update-user", { data: { email: "dev@example.com" } }],
    ["/admin/update-user", { data: { emailVerified: true } }],
  ])("refuses %s with %j", (path, body) => {
    expect(() => assertSafeAdminUserInput(path, body, listed)).toThrow();
  });

  it.each([
    ["/admin/create-user", { email: "a@b.com", name: "A" }],
    ["/admin/update-user", { data: { name: "New name" } }],
    ["/sign-up/email", { email: "dev@example.com" }],
  ])("allows %s with %j", (path, body) => {
    expect(() => assertSafeAdminUserInput(path, body, listed)).not.toThrow();
  });
});
