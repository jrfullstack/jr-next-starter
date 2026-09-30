import { describe, expect, it } from "vitest";
import {
  type AuthPolicy,
  canSignUp,
  defaultAuthPolicy,
  disabledAccessMethods,
  parseAuthPolicy,
  policyChanges,
  policyViolations,
} from "./policy";

function withChanges(changes: {
  general?: Partial<AuthPolicy["general"]>;
  emailPassword?: Partial<AuthPolicy["emailPassword"]>;
}): AuthPolicy {
  return {
    general: { ...defaultAuthPolicy.general, ...changes.general },
    emailPassword: {
      ...defaultAuthPolicy.emailPassword,
      ...changes.emailPassword,
    },
  };
}

const passwordOff = withChanges({ emailPassword: { access: false } });

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
    });
  });

  it("fills in fields that a stored policy doesn't have yet", () => {
    const policy = parseAuthPolicy({ general: { signUp: false } });
    expect(policy.general.signUp).toBe(false);
    expect(policy.emailPassword.access).toBe(true);
  });

  it.each([7, 129, 8.5])(
    "rejects a minimum password length of %s",
    (minPasswordLength) => {
      expect(() =>
        parseAuthPolicy({ emailPassword: { minPasswordLength } }),
      ).toThrow();
    },
  );
});

describe("canSignUp", () => {
  it.each([
    [{}, true],
    [{ general: { signUp: false } }, false],
    [{ emailPassword: { signUp: false } }, false],
  ] as const)("%j → %s", (changes, expected) => {
    expect(canSignUp(withChanges(changes), "emailPassword")).toBe(expected);
  });
});

describe("policyViolations", () => {
  it("accepts the defaults", () => {
    expect(policyViolations(defaultAuthPolicy, [["emailPassword"]])).toEqual(
      [],
    );
  });

  it("refuses turning off the last way to sign in and recover", () => {
    expect(policyViolations(passwordOff, [])).toEqual([
      "noAccessMethod",
      "noRecoveryMethod",
    ]);
  });

  it("refuses leaving a superadmin without any of their methods", () => {
    expect(policyViolations(passwordOff, [["emailPassword"]])).toContain(
      "superadminLockedOut",
    );
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
      emailPassword: { minPasswordLength: 12 },
    });
    expect(policyChanges(defaultAuthPolicy, after)).toEqual([
      { section: "general", field: "signUp", from: true, to: false },
      {
        section: "emailPassword",
        field: "minPasswordLength",
        from: 8,
        to: 12,
      },
    ]);
  });
});
