import { APIError } from "better-auth/api";
import { safeCallbackPath } from "@/lib/auth/routes";
import { type AccessMethod, type AuthPolicy, canSignIn } from "./policy";

/** Better Auth endpoints that sign in with each method */
const signInPaths: Record<string, AccessMethod> = {
  "/sign-in/email": "emailPassword",
  "/sign-in/magic-link": "magicLink",
  "/magic-link/verify": "magicLink",
};

const SIGN_IN_METHOD_DISABLED = "SIGN_IN_METHOD_DISABLED";

/**
 * Where a magic link opened after its method was turned off lands: the
 * errorCallbackURL the sign-in form set (same-site paths only) with the code.
 */
export function disabledMagicLinkRedirect(query: unknown) {
  const { errorCallbackURL } = (query ?? {}) as { errorCallbackURL?: unknown };
  const path = safeCallbackPath(
    typeof errorCallbackURL === "string" ? errorCallbackURL : undefined,
  );
  const [pathname = "/", search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("error", SIGN_IN_METHOD_DISABLED);
  return `${pathname}?${params}`;
}

/** Admin endpoints that set a password; Better Auth only checks the maximum length there */
const adminPasswordPaths = new Set([
  "/admin/create-user",
  "/admin/set-user-password",
]);

function passwordOf(body: unknown) {
  if (typeof body !== "object" || body === null) return undefined;
  const { password, newPassword } = body as Record<string, unknown>;
  const value = password ?? newPassword;
  return typeof value === "string" ? value : undefined;
}

/**
 * Before hook: what Better Auth's own options can't express. Refuses signing
 * in with a disabled method and passwords the admin endpoints would accept
 * below the configured minimum.
 */
export function assertPolicyAllows(
  policy: AuthPolicy,
  path: string,
  body: unknown,
) {
  const method = signInPaths[path];
  if (method && !canSignIn(policy, method)) {
    throw new APIError("FORBIDDEN", {
      code: SIGN_IN_METHOD_DISABLED,
      message: "This sign-in method is disabled",
    });
  }
  const password = passwordOf(body);
  if (
    adminPasswordPaths.has(path) &&
    password !== undefined &&
    password.length < policy.emailPassword.minPasswordLength
  ) {
    throw new APIError("BAD_REQUEST", {
      code: "PASSWORD_TOO_SHORT",
      message: "Password too short",
    });
  }
}
