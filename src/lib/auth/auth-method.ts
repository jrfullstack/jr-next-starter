/** How a session signed in, from the endpoint that created it */
const authMethods: Record<string, string> = {
  "/sign-in/email": "password",
  "/magic-link/verify": "magic-link",
  "/callback/google": "google",
  "/passkey/verify-authentication": "passkey",
};

/**
 * Stored on the session (`authMethod`): a passkey sign-in already is two
 * factors, so it meets a required 2FA (docs/plans/auth.md §17).
 */
export function authMethodOf(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith("/two-factor/verify-")) return "two-factor";
  return authMethods[path];
}
