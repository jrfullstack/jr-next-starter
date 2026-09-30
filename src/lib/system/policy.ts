import { z } from "zod";

/** Better Auth's own bounds for passwords */
export const PASSWORD_LENGTH = { min: 8, max: 128 } as const;

export const twoFactorLevels = ["off", "optional", "required"] as const;

/** How long a magic link stays valid, in minutes */
export const MAGIC_LINK_MINUTES = { min: 1, max: 60, default: 5 } as const;

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
  magicLink: z
    .object({
      access: z.boolean().default(false),
      /** An unknown email creates the account when it opens the link */
      signUp: z.boolean().default(false),
      expiresInMinutes: z
        .int()
        .min(MAGIC_LINK_MINUTES.min)
        .max(MAGIC_LINK_MINUTES.max)
        .default(MAGIC_LINK_MINUTES.default),
    })
    .prefault({}),
  twoFactor: z
    .object({
      /** off: nobody can turn it on · optional: users choose, admins must · required: everyone */
      level: z.enum(twoFactorLevels).default("optional"),
      /** A code sent by email as a second factor (besides the authenticator app) */
      emailOtp: z.boolean().default(false),
      /** "Remember this device" skips the second factor for 30 days */
      trustDevice: z.boolean().default(false),
    })
    .prefault({}),
  /** Only takes effect with credentials (see effectivePolicy) */
  google: z
    .object({
      access: z.boolean().default(true),
      /** First sign-in with a Google account that has no account here */
      signUp: z.boolean().default(true),
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

/** Sign-in methods. Passkeys join in a later step. */
const accessMethods = ["emailPassword", "magicLink", "google"] as const;
export type AccessMethod = (typeof accessMethods)[number];

/** What the deployment can offer regardless of the policy (Google needs credentials) */
export type AuthCapabilities = { google: boolean };

/**
 * The policy as it applies: a method the deployment can't offer is off,
 * whatever the superadmin saved. Everything that enforces or shows sign-in
 * methods reads this one.
 */
export function effectivePolicy(
  policy: AuthPolicy,
  capabilities: AuthCapabilities,
): AuthPolicy {
  if (capabilities.google) return policy;
  return { ...policy, google: { access: false, signUp: false } };
}

/** Methods any account can use, linked or not: a magic link only needs the email */
const universalMethods: readonly AccessMethod[] = ["magicLink"];

/** Methods that let someone who lost access get back in */
const recoveryMethods: readonly AccessMethod[] = ["emailPassword", "magicLink"];

export function canSignUp(policy: AuthPolicy, method: AccessMethod) {
  return policy.general.signUp && policy[method].signUp;
}

/** Whether any method accepts new accounts (shows the "Sign up" links) */
export function canSignUpAny(policy: AuthPolicy) {
  return accessMethods.some((method) => canSignUp(policy, method));
}

export function canSignIn(policy: AuthPolicy, method: AccessMethod) {
  return policy[method].access;
}

/** Whether an account with these linked methods could still sign in */
function canStillSignIn(policy: AuthPolicy, linked: readonly AccessMethod[]) {
  return [...linked, ...universalMethods].some((method) =>
    canSignIn(policy, method),
  );
}

/** Account providerId that each method leaves in the account table (magic link leaves none) */
const methodProviders: Partial<Record<AccessMethod, string>> = {
  emailPassword: "credential",
  google: "google",
};

/** Sign-in methods behind an account's linked providers ("credential" → emailPassword) */
export function methodsOfProviders(providerIds: readonly string[]) {
  return accessMethods.filter((method) =>
    providerIds.some((providerId) => providerId === methodProviders[method]),
  );
}

/** Unlinking `providerId` must leave the user some method that works with this policy */
export function canUnlink(
  policy: AuthPolicy,
  linkedProviderIds: readonly string[],
  providerId: string,
) {
  const remaining = linkedProviderIds.filter((linked) => linked !== providerId);
  return canStillSignIn(policy, methodsOfProviders(remaining));
}

/** Roles that must use 2FA whenever it isn't off (docs/plans/auth.md §6) */
const privilegedRoles = new Set(["admin", "superadmin"]);

/** Whether this role has to set up a second factor to use the app */
export function twoFactorRequired(
  policy: AuthPolicy,
  role: string | null | undefined,
) {
  const { level } = policy.twoFactor;
  if (level === "required") return true;
  return level === "optional" && privilegedRoles.has(role ?? "");
}

export type PolicyViolation =
  | "noAccessMethod"
  | "noRecoveryMethod"
  | "superadminLockedOut";

/**
 * Safeguards (docs/plans/auth.md §5): a change is refused if nobody could
 * sign in, nobody could recover their account, or a superadmin would be left
 * without any method they can use. `superadminMethods` lists, per superadmin,
 * the methods linked to their account.
 */
export function policyViolations(
  policy: AuthPolicy,
  superadminMethods: readonly (readonly AccessMethod[])[],
): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  if (!accessMethods.some((method) => canSignIn(policy, method))) {
    violations.push("noAccessMethod");
  }
  if (!recoveryMethods.some((method) => canSignIn(policy, method))) {
    violations.push("noRecoveryMethod");
  }
  if (!superadminMethods.every((linked) => canStillSignIn(policy, linked))) {
    violations.push("superadminLockedOut");
  }
  return violations;
}

/** Users that share the same linked methods, e.g. { methods: ["emailPassword"], count: 12 } */
export type UserMethodGroup = { methods: AccessMethod[]; count: number };

/** How many users would have no way to sign in with this policy (shown before saving) */
export function usersLockedOut(
  policy: AuthPolicy,
  groups: readonly UserMethodGroup[],
) {
  return groups
    .filter(({ methods }) => !canStillSignIn(policy, methods))
    .reduce((total, { count }) => total + count, 0);
}

/** Methods whose sign-in this change turns off (they need an explicit confirmation) */
export function disabledAccessMethods(before: AuthPolicy, after: AuthPolicy) {
  return accessMethods.filter(
    (method) => canSignIn(before, method) && !canSignIn(after, method),
  );
}

type PolicySection = keyof AuthPolicy;
export type PolicyValue = boolean | number | (typeof twoFactorLevels)[number];

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
