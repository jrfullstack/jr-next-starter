import { describe, expect, it } from "vitest";
import { visibleSections } from "./sections";
import {
  nextSort,
  parseUsersQuery,
  rowPermissions,
  userStatus,
  usersHref,
  usersOrderBy,
  usersWhere,
} from "./users";

describe("parseUsersQuery", () => {
  it("reads every list param from the URL", () => {
    expect(
      parseUsersQuery({
        q: " ada ",
        role: "admin",
        status: "banned",
        sort: "name",
        order: "asc",
        page: "3",
      }),
    ).toEqual({
      search: "ada",
      role: "admin",
      status: "banned",
      sort: "name",
      order: "asc",
      page: 3,
    });
  });

  it("ignores values outside the whitelists and falls back to defaults", () => {
    expect(
      parseUsersQuery({
        sort: "password",
        order: "sideways",
        role: "root",
        page: "-2",
      }),
    ).toEqual({
      search: "",
      role: undefined,
      status: undefined,
      sort: "createdAt",
      order: "desc",
      page: 1,
    });
  });
});

describe("usersWhere", () => {
  it("combines search (name or email), role and status", () => {
    const query = parseUsersQuery({
      q: "ada",
      role: "user",
      status: "verified",
    });

    expect(usersWhere(query)).toEqual({
      AND: [
        {
          OR: [
            { name: { contains: "ada", mode: "insensitive" } },
            { email: { contains: "ada", mode: "insensitive" } },
          ],
        },
        { OR: [{ role: "user" }, { role: null }] },
        {
          AND: [
            { OR: [{ banned: false }, { banned: null }] },
            { emailVerified: true },
          ],
        },
      ],
    });
  });

  it("orders by the chosen column with id as a stable tiebreaker", () => {
    expect(
      usersOrderBy(parseUsersQuery({ sort: "email", order: "asc" })),
    ).toEqual([{ email: "asc" }, { id: "asc" }]);
  });
});

describe("usersHref", () => {
  const query = parseUsersQuery({ q: "ada", status: "banned", page: "4" });

  it("keeps the state, goes back to page 1 on changes and omits defaults", () => {
    expect(usersHref(query, nextSort(query, "name"))).toEqual({
      pathname: "/admin/users",
      query: { q: "ada", status: "banned", sort: "name", order: "asc" },
    });
    expect(usersHref(query, { page: 5 }).query).toEqual({
      q: "ada",
      status: "banned",
      page: "5",
    });
  });

  it("flips the order when sorting by the same column again", () => {
    const byName = parseUsersQuery({ sort: "name", order: "asc" });
    expect(nextSort(byName, "name")).toEqual({ sort: "name", order: "desc" });
  });
});

describe("userStatus", () => {
  it("prioritizes banned over unverified", () => {
    expect(userStatus({ id: "1", banned: true, emailVerified: false })).toBe(
      "banned",
    );
    expect(userStatus({ id: "1", emailVerified: false })).toBe("unverified");
    expect(userStatus({ id: "1", emailVerified: true })).toBe("verified");
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
      removeTwoFactor: false,
    });
  });

  it("offers removing 2FA only to users who have it", () => {
    const withTwoFactor = { ...user, twoFactorEnabled: true };
    expect(
      rowPermissions({ id: "a1", role: "admin" }, withTwoFactor)
        .removeTwoFactor,
    ).toBe(true);
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
  it("shows users to admins and system only to superadmins", () => {
    expect(visibleSections("superadmin").map(({ id }) => id)).toEqual([
      "users",
      "system",
    ]);
    expect(visibleSections("admin").map(({ id }) => id)).toEqual(["users"]);
    expect(visibleSections("user")).toEqual([]);
    expect(visibleSections(undefined)).toEqual([]);
  });
});
