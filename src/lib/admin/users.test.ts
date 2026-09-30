import { describe, expect, it } from "vitest";
import { visibleSections } from "./sections";
import {
  parseUsersQuery,
  rowPermissions,
  USERS_PAGE_SIZE,
  userStatus,
} from "./users";

describe("parseUsersQuery", () => {
  it("reads search and page, falling back to the first page", () => {
    expect(parseUsersQuery({ q: " ada ", page: "3" })).toEqual({
      search: "ada",
      page: 3,
      offset: 2 * USERS_PAGE_SIZE,
    });
    expect(parseUsersQuery({ page: "-2" }).page).toBe(1);
    expect(parseUsersQuery({ page: "abc" }).page).toBe(1);
  });
});

describe("userStatus", () => {
  it("prioritizes banned over unverified", () => {
    expect(userStatus({ id: "1", banned: true, emailVerified: false })).toBe(
      "banned",
    );
    expect(userStatus({ id: "1", emailVerified: false })).toBe("unverified");
    expect(userStatus({ id: "1", emailVerified: true })).toBe("active");
  });
});

describe("rowPermissions", () => {
  const user = { id: "u1", role: "user", emailVerified: true };
  const superadminRow = { id: "s1", role: "superadmin", emailVerified: true };

  it("lets an admin ban and sign users out, but not change roles", () => {
    expect(rowPermissions({ id: "a1", role: "admin" }, user)).toEqual({
      manageable: true,
      ban: true,
      revokeSessions: true,
      setRole: false,
    });
  });

  it("lets only the superadmin change roles", () => {
    expect(rowPermissions({ id: "s2", role: "superadmin" }, user).setRole).toBe(
      true,
    );
  });

  it.each([
    ["a superadmin account", superadminRow],
    ["your own account", { ...user, id: "a1" }],
  ])("never manages %s", (_case, target) => {
    expect(rowPermissions({ id: "a1", role: "admin" }, target).manageable).toBe(
      false,
    );
  });
});

describe("visibleSections", () => {
  it("shows the users section to admins only", () => {
    expect(visibleSections("admin").map(({ id }) => id)).toEqual(["users"]);
    expect(visibleSections("user")).toEqual([]);
    expect(visibleSections(undefined)).toEqual([]);
  });
});
