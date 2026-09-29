import { describe, expect, it } from "vitest";
import { authErrorKey } from "./errors";
import { isProtectedPath, safeCallbackPath, splitLocale } from "./routes";

describe("auth routes", () => {
  it("splits the locale prefix from the path", () => {
    expect(splitLocale("/es/dashboard/settings")).toEqual({
      locale: "es",
      path: "/dashboard/settings",
    });
    expect(splitLocale("/dashboard")).toEqual({
      locale: undefined,
      path: "/dashboard",
    });
  });

  it("protects the configured sections and their subpaths only", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/admin/users")).toBe(true);
    expect(isProtectedPath("/dashboards")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
  });

  it.each([
    ["https://evil.com", "/dashboard"],
    ["//evil.com", "/dashboard"],
    [undefined, "/dashboard"],
    ["/account/security", "/account/security"],
  ])("only allows same-site callback paths (%s)", (value, expected) => {
    expect(safeCallbackPath(value)).toBe(expected);
  });
});

describe("authErrorKey", () => {
  it("translates known Better Auth codes and falls back to generic", () => {
    expect(authErrorKey("INVALID_EMAIL_OR_PASSWORD")).toBe(
      "invalidCredentials",
    );
    expect(authErrorKey("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")).toBe(
      "userExists",
    );
    expect(authErrorKey("SOMETHING_NEW")).toBe("generic");
    expect(authErrorKey(undefined)).toBe("generic");
  });
});
