import { describe, expect, it } from "vitest";
import { type AuthPolicy, defaultAuthPolicy } from "./policy";
import { assertPolicyAllows, disabledMagicLinkRedirect } from "./policy-guard";

const passwordOff: AuthPolicy = {
  ...defaultAuthPolicy,
  emailPassword: { ...defaultAuthPolicy.emailPassword, access: false },
};
const magicLinkOff: AuthPolicy = {
  ...defaultAuthPolicy,
  magicLink: { ...defaultAuthPolicy.magicLink, access: false },
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

  it.each(["/sign-in/magic-link", "/magic-link/verify"])(
    "refuses %s with magic link turned off",
    (path) => {
      expect(() => assertPolicyAllows(magicLinkOff, path, {})).toThrow(
        "This sign-in method is disabled",
      );
    },
  );

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

describe("disabledMagicLinkRedirect", () => {
  it("sends the link back to the sign-in page with the reason", () => {
    expect(
      disabledMagicLinkRedirect({ errorCallbackURL: "/en/sign-in?x=1" }),
    ).toBe("/en/sign-in?x=1&error=SIGN_IN_METHOD_DISABLED");
  });

  it("never redirects to another site", () => {
    expect(
      disabledMagicLinkRedirect({ errorCallbackURL: "https://evil.com" }),
    ).toBe("/dashboard?error=SIGN_IN_METHOD_DISABLED");
  });
});
