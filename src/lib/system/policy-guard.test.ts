import { describe, expect, it } from "vitest";
import { type AuthPolicy, defaultAuthPolicy } from "./policy";
import { assertPolicyAllows } from "./policy-guard";

const passwordOff: AuthPolicy = {
  ...defaultAuthPolicy,
  emailPassword: { ...defaultAuthPolicy.emailPassword, access: false },
};
const minTwelve: AuthPolicy = {
  ...defaultAuthPolicy,
  emailPassword: { ...defaultAuthPolicy.emailPassword, minPasswordLength: 12 },
};

describe("assertPolicyAllows", () => {
  it("refuses signing in with a disabled method", () => {
    expect(() => assertPolicyAllows(passwordOff, "/sign-in/email", {})).toThrow(
      "This sign-in method is disabled",
    );
  });

  it("lets everything else through", () => {
    expect(() =>
      assertPolicyAllows(passwordOff, "/get-session", undefined),
    ).not.toThrow();
    expect(() =>
      assertPolicyAllows(defaultAuthPolicy, "/sign-in/email", {}),
    ).not.toThrow();
  });

  it.each([
    ["/admin/create-user", { password: "short-pass" }],
    ["/admin/set-user-password", { newPassword: "short-pass" }],
  ])("applies the configured minimum on %s", (path, body) => {
    expect(() => assertPolicyAllows(minTwelve, path, body)).toThrow(
      "Password too short",
    );
    expect(() =>
      assertPolicyAllows(minTwelve, path, {
        password: "long-enough-pass",
        newPassword: "long-enough-pass",
      }),
    ).not.toThrow();
  });
});
