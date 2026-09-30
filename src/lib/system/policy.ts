import { z } from "zod";

/** Better Auth's own bounds for passwords */
export const PASSWORD_LENGTH = { min: 8, max: 128 } as const;

/**
 * Auth configuration chosen by the superadmin (docs/plans/auth.md §5).
 * Every field has a default: a missing row or fields added by later steps
 * resolve to the current behavior without a migration.
 */
export const authPolicySchema = z.object({
  general: z
    .object({
      /** Master switch: with it off, no method accepts new accounts */
      signUp: z.boolean().default(true),
    })
    .prefault({}),
  emailPassword: z
    .object({
      signUp: z.boolean().default(true),
      access: z.boolean().default(true),
      requireEmailVerification: z.boolean().default(true),
      minPasswordLength: z
        .int()
        .min(PASSWORD_LENGTH.min)
        .max(PASSWORD_LENGTH.max)
        .default(PASSWORD_LENGTH.min),
    })
    .prefault({}),
});

export type AuthPolicy = z.infer<typeof authPolicySchema>;

export const defaultAuthPolicy: AuthPolicy = authPolicySchema.parse({});

/**
 * Stored JSON → policy. Saves are validated, so invalid data means a manual
 * edit: fail loudly instead of silently reopening what the superadmin closed.
 */
export function parseAuthPolicy(stored: unknown): AuthPolicy {
  return authPolicySchema.parse(stored ?? {});
}

/** Sign-in methods. Magic link, Google and passkeys join in later steps. */
export const accessMethods = ["emailPassword"] as const;
export type AccessMethod = (typeof accessMethods)[number];

/** Methods that let someone who lost access get back in (password reset today) */
const recoveryMethods: readonly AccessMethod[] = ["emailPassword"];

export function canSignUp(policy: AuthPolicy, method: AccessMethod) {
  return policy.general.signUp && policy[method].signUp;
}

export function canSignIn(policy: AuthPolicy, method: AccessMethod) {
  return policy[method].access;
}

export type PolicyViolation =
  | "noAccessMethod"
  | "noRecoveryMethod"
  | "superadminLockedOut";

/**
 * Safeguards (docs/plans/auth.md §5): a change is refused if nobody could
 * sign in, nobody could recover their account, or a superadmin would be left
 * without any method they use. `superadminMethods` lists, per superadmin,
 * the methods linked to their account.
 */
export function policyViolations(
  policy: AuthPolicy,
  superadminMethods: readonly (readonly AccessMethod[])[],
): PolicyViolation[] {
  const enabled = accessMethods.filter((method) => canSignIn(policy, method));
  const violations: PolicyViolation[] = [];
  if (enabled.length === 0) violations.push("noAccessMethod");
  if (!recoveryMethods.some((method) => enabled.includes(method))) {
    violations.push("noRecoveryMethod");
  }
  const lockedOut = superadminMethods.some(
    (methods) => !methods.some((method) => enabled.includes(method)),
  );
  if (lockedOut) violations.push("superadminLockedOut");
  return violations;
}

/** Methods whose sign-in this change turns off (they need an explicit confirmation) */
export function disabledAccessMethods(before: AuthPolicy, after: AuthPolicy) {
  return accessMethods.filter(
    (method) => canSignIn(before, method) && !canSignIn(after, method),
  );
}

type PolicySection = keyof AuthPolicy;
type PolicyValue = boolean | number;

/** One changed field; `section` narrows `field`, so labels can be looked up with types */
export type PolicyChange = {
  [Section in PolicySection]: {
    section: Section;
    field: keyof AuthPolicy[Section] & string;
    from: PolicyValue;
    to: PolicyValue;
  };
}[PolicySection];

/** Field-by-field differences, for the change history */
export function policyChanges(
  before: AuthPolicy,
  after: AuthPolicy,
): PolicyChange[] {
  const sections = Object.keys(after) as PolicySection[];
  return sections.flatMap((section) =>
    Object.entries(after[section])
      .map(([field, to]) => ({
        section,
        field,
        from: (before[section] as Record<string, PolicyValue>)[field],
        to,
      }))
      .filter(({ from, to }) => from !== to),
  ) as PolicyChange[];
}
