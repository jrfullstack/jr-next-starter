/** Better Auth error codes we translate (keys of Auth.errors in messages) */
const knownErrors = {
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  USER_ALREADY_EXISTS: "userExists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "userExists",
  PASSWORD_TOO_SHORT: "passwordTooShort",
  PASSWORD_TOO_LONG: "passwordTooLong",
  BANNED_USER: "banned",
  EMAIL_NOT_VERIFIED: "emailNotVerified",
  TOO_MANY_REQUESTS: "tooManyRequests",
  EMAIL_PASSWORD_SIGN_UP_DISABLED: "signUpClosed",
  SIGN_IN_METHOD_DISABLED: "signInMethodDisabled",
} as const;

export type AuthErrorKey =
  | (typeof knownErrors)[keyof typeof knownErrors]
  | "generic";

const TOO_MANY_REQUESTS_STATUS = 429;

/** Maps a Better Auth error (code, or HTTP status when there's no code) to a translatable message key */
export function authErrorKey(
  code: string | undefined,
  status?: number,
): AuthErrorKey {
  // The rate limiter answers 429 without an error code
  if (status === TOO_MANY_REQUESTS_STATUS) return "tooManyRequests";
  if (code && code in knownErrors) {
    return knownErrors[code as keyof typeof knownErrors];
  }
  return "generic";
}

/** ?error= codes Better Auth adds when a magic link or Google can't sign in */
const callbackErrors = {
  SIGN_IN_METHOD_DISABLED: "errors.signInMethodDisabled",
  new_user_signup_disabled: "callbackErrors.noAccount",
  signup_disabled: "callbackErrors.noAccount",
  account_not_linked: "callbackErrors.accountNotLinked",
  access_denied: "callbackErrors.cancelled",
  INVALID_TOKEN: "callbackErrors.invalidLink",
} as const;

/** Message (key of Auth in messages) for the sign-in page after a failed magic link or Google sign-in */
export function callbackErrorMessage(error: unknown) {
  if (typeof error !== "string") return undefined;
  if (error in callbackErrors) {
    return callbackErrors[error as keyof typeof callbackErrors];
  }
  return "callbackErrors.generic" as const;
}
