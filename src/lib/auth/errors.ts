/** Better Auth error codes we translate (keys of Auth.errors in messages) */
const knownErrors = {
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  USER_ALREADY_EXISTS: "userExists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "userExists",
  PASSWORD_TOO_SHORT: "passwordTooShort",
  PASSWORD_TOO_LONG: "passwordTooLong",
  BANNED_USER: "banned",
  TOO_MANY_REQUESTS: "tooManyRequests",
} as const;

export type AuthErrorKey =
  | (typeof knownErrors)[keyof typeof knownErrors]
  | "generic";

/** Maps a Better Auth error code to a translatable message key */
export function authErrorKey(code: string | undefined): AuthErrorKey {
  if (code && code in knownErrors) {
    return knownErrors[code as keyof typeof knownErrors];
  }
  return "generic";
}
