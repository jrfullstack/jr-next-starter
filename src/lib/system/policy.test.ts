import { describe, expect, it } from "vitest";
import {
  type AuthPolicy,
  canSignUp,
  defaultAuthPolicy,
  disabledAccessMethods,
  effectivePolicy,
  parseAuthPolicy,
  policyChanges,
  policyViolations,
  usersLockedOut,
} from "./policy";

type PolicyChanges = {
  [Section in keyof AuthPolicy]?: Partial<AuthPolicy[Section]>;
};

function withChanges(changes: PolicyChanges): AuthPolicy {
  return {
    general: { ...defaultAuthPolicy.general, ...changes.general },
    emailPassword: {
      ...defaultAuthPolicy.emailPassword,
      ...changes.emailPassword,
    },
    magicLink: { ...defaultAuthPolicy.magicLink, ...changes.magicLink },
    google: { ...defaultAuthPolicy.google, ...changes.google },
  };
}

const passwordOff = withChanges({ emailPassword: { access: false } });
const magicLinkOff = withChanges({ magicLink: { access: false } });
const everythingOff = withChanges({
  emailPassword: { access: false },
  magicLink: { access: false },
  google: { access: false },
});

describe("parseAuthPolicy", () => {
  it("defaults to the current behavior when nothing is stored", () => {
    expect(parseAuthPolicy(null)).toEqual({
      general: { signUp: true },
      emailPassword: {
        signUp: true,
        access: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
      },
      magicLink: { access: true, signUp: false, expiresInMinutes: 5 },
      google: { access: true, signUp: true },
    });
  });

  it("fills in fields that a stored policy doesn't have yet", () => {
    const policy = parseAuthPolicy({ general: { signUp: false } });
    expect(policy.general.signUp).toBe(false);
    expect(policy.magicLink.access).toBe(true);
  });

  it.each([
    { emailPassword: { minPasswordLength: 7 } },
    { emailPassword: { minPasswordLength: 8.5 } },
    { magicLink: { expiresInMinutes: 0 } },
    { magicLink: { expiresInMinutes: 61 } },
  ])("rejects %j", (stored) => {
    expect(() => parseAuthPolicy(stored)).toThrow();
  });
});

describe("canSignUp", () => {
  it.each([
    [{}, "emailPassword", true],
    [{}, "magicLink", false],
    [{ magicLink: { signUp: true } }, "magicLink", true],
    [{ general: { signUp: false } }, "emailPassword", false],
    [{ emailPassword: { signUp: false } }, "emailPassword", false],
  ] as const)("%j allows %s: %s", (changes, method, expected) => {
    expect(canSignUp(withChanges(changes), method)).toBe(expected);
  });
});

describe("policyViolations", () => {
  const passwordSuperadmin = [["emailPassword"] as const];

  it("accepts turning off either method while the other one works", () => {
    expect(policyViolations(passwordOff, passwordSuperadmin)).toEqual([]);
    expect(policyViolations(magicLinkOff, passwordSuperadmin)).toEqual([]);
  });

  it("refuses turning off every way to sign in", () => {
    expect(policyViolations(everythingOff, passwordSuperadmin)).toEqual([
      "noAccessMethod",
      "noRecoveryMethod",
      "superadminLockedOut",
    ]);
  });

  it("refuses leaving a superadmin without a usable method", () => {
    // Only magic link is universal: a superadmin without a password relies on it
    expect(policyViolations(magicLinkOff, [[]])).toEqual([
      "superadminLockedOut",
    ]);
  });
});

describe("usersLockedOut", () => {
  const groups = [
    { methods: ["emailPassword" as const], count: 5 },
    { methods: [], count: 2 },
  ];

  it("counts users left without any usable method", () => {
    expect(usersLockedOut(passwordOff, groups)).toBe(0);
    expect(usersLockedOut(magicLinkOff, groups)).toBe(2);
    expect(usersLockedOut(everythingOff, groups)).toBe(7);
  });
});

describe("disabledAccessMethods", () => {
  it("lists only methods whose sign-in is being turned off", () => {
    expect(disabledAccessMethods(defaultAuthPolicy, passwordOff)).toEqual([
      "emailPassword",
    ]);
    expect(disabledAccessMethods(passwordOff, defaultAuthPolicy)).toEqual([]);
  });
});

describe("policyChanges", () => {
  it("returns only the fields that changed", () => {
    const after = withChanges({
      general: { signUp: false },
      magicLink: { expiresInMinutes: 15 },
    });
    expect(policyChanges(defaultAuthPolicy, after)).toEqual([
      { section: "general", field: "signUp", from: true, to: false },
      { section: "magicLink", field: "expiresInMinutes", from: 5, to: 15 },
    ]);
  });
});

describe("effectivePolicy", () => {
  it("turns Google off without credentials, whatever was saved", () => {
    expect(
      effectivePolicy(defaultAuthPolicy, { google: false }).google,
    ).toEqual({ access: false, signUp: false });
    expect(effectivePolicy(defaultAuthPolicy, { google: true })).toBe(
      defaultAuthPolicy,
    );
  });
});

describe("usersLockedOut with Google", () => {
  it("counts Google-only users when Google and the magic link are off", () => {
    const groups = [{ methods: ["google" as const], count: 3 }];
    const noLink = withChanges({ magicLink: { access: false } });
    expect(usersLockedOut(noLink, groups)).toBe(0);
    expect(
      usersLockedOut(
        withChanges({
          magicLink: { access: false },
          google: { access: false },
        }),
        groups,
      ),
    ).toBe(3);
  });
});
