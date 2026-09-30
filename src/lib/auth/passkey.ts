import { passkey } from "@better-auth/passkey";
import { APIError } from "better-auth/api";
import { siteConfig } from "@/config/site";
import { env } from "@/env";

/** Relying party = this site: passkeys only work on the domain they were created for */
export function passkeyPlugin() {
  const { hostname, origin } = new URL(env.NEXT_PUBLIC_APP_URL);
  return passkey({
    rpID: hostname,
    rpName: siteConfig.name,
    origin,
    // Discoverable (sign in without typing the email) and with fingerprint/face/PIN
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
  });
}

/** Bit 2 of the authenticator data flags: the device verified the user (fingerprint, face, PIN) */
const USER_VERIFIED = 0x04;
const FLAGS_BYTE = 32;

/**
 * Before /passkey/verify-authentication: Better Auth only "prefers" user
 * verification. A passkey counts as two factors here, so require it. The
 * flags are signed by the authenticator: faking them fails verification.
 */
export function assertPasskeyUserVerified(path: string, body: unknown) {
  if (path !== "/passkey/verify-authentication") return;
  const data = (
    body as { response?: { response?: { authenticatorData?: unknown } } }
  )?.response?.response?.authenticatorData;
  const flags =
    typeof data === "string"
      ? Buffer.from(data, "base64url").at(FLAGS_BYTE)
      : undefined;
  if (flags === undefined || (flags & USER_VERIFIED) === 0) {
    throw new APIError("FORBIDDEN", {
      code: "PASSKEY_NOT_VERIFIED",
      message: "The passkey didn't verify the user",
    });
  }
}
