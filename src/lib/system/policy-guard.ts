import { APIError } from "better-auth/api";
import { authRoutes } from "@/lib/auth/routes";
import { type AccessMethod, type AuthPolicy, canSignIn } from "./policy";

/** Better Auth endpoints that sign in with each method */
const signInPaths: Record<string, AccessMethod> = {
  "/sign-in/email": "emailPassword",
  "/sign-in/magic-link": "magicLink",
  "/magic-link/verify": "magicLink",
  "/callback/google": "google",
};

/** Method a request signs in with; social sign-in names its provider in the body */
function signInMethod(path: string, body: unknown) {
  if (path === "/sign-in/social") {
    const { provider } = (body ?? {}) as { provider?: unknown };
    return provider === "google" ? "google" : undefined;
  }
  return signInPaths[path];
}

const SIGN_IN_METHOD_DISABLED = "SIGN_IN_METHOD_DISABLED";

/** Opened in the browser (the emailed link, Google coming back): they redirect, never answer JSON */
const browserPaths = new Set(["/magic-link/verify", "/callback/google"]);

function sameSitePath(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

/**
 * Where a browser request for a disabled method lands: the errorCallbackURL
 * the sign-in form set (same-site only), or the sign-in page, with the code.
 * Undefined when the request isn't one of those or the method is on.
 */
export function disabledMethodRedirect(
  policy: AuthPolicy,
  path: string,
  query: unknown,
) {
  const method = signInMethod(path, undefined);
  if (!(method && browserPaths.has(path)) || canSignIn(policy, method)) {
    return undefined;
  }
  const { errorCallbackURL } = (query ?? {}) as { errorCallbackURL?: unknown };
  const target = sameSitePath(errorCallbackURL) ?? authRoutes.signIn;
  const [pathname = "/", search = ""] = target.split("?");
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
  const method = signInMethod(path, body);
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
