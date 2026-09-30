import { describe, expect, it } from "vitest";
import { type AuthPolicy, defaultAuthPolicy } from "./policy";
import { assertPolicyAllows, disabledMethodRedirect } from "./policy-guard";

const passwordOff: AuthPolicy = {
  ...defaultAuthPolicy,
  emailPassword: { ...defaultAuthPolicy.emailPassword, access: false },
};
const magicLinkOff: AuthPolicy = {
  ...defaultAuthPolicy,
  magicLink: { ...defaultAuthPolicy.magicLink, access: false },
};
const googleOff: AuthPolicy = {
  ...defaultAuthPolicy,
  google: { ...defaultAuthPolicy.google, access: false },
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

  it("refuses Google sign-in and callback with Google turned off", () => {
    expect(() =>
      assertPolicyAllows(googleOff, "/sign-in/social", { provider: "google" }),
    ).toThrow("This sign-in method is disabled");
    expect(() =>
      assertPolicyAllows(googleOff, "/callback/google", undefined),
    ).toThrow("This sign-in method is disabled");
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

describe("disabledMethodRedirect", () => {
  it("sends a disabled magic link back to its sign-in page with the reason", () => {
    expect(
      disabledMethodRedirect(magicLinkOff, "/magic-link/verify", {
        errorCallbackURL: "/en/sign-in?x=1",
      }),
    ).toBe("/en/sign-in?x=1&error=SIGN_IN_METHOD_DISABLED");
  });

  it("sends Google's callback to sign-in, never to another site", () => {
    expect(
      disabledMethodRedirect(googleOff, "/callback/google", {
        errorCallbackURL: "https://evil.com",
      }),
    ).toBe("/sign-in?error=SIGN_IN_METHOD_DISABLED");
  });

  it("leaves enabled methods and API calls alone", () => {
    expect(
      disabledMethodRedirect(defaultAuthPolicy, "/callback/google", {}),
    ).toBeUndefined();
    expect(
      disabledMethodRedirect(magicLinkOff, "/sign-in/magic-link", {}),
    ).toBeUndefined();
  });
});
