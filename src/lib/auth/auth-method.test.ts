import { describe, expect, it } from "vitest";
import { authMethodOf } from "./auth-method";

describe("authMethodOf", () => {
  it.each([
    ["/passkey/verify-authentication", "passkey"],
    ["/sign-in/email", "password"],
    ["/two-factor/verify-totp", "two-factor"],
    ["/admin/impersonate-user", undefined],
    [undefined, undefined],
  ])("%s → %s", (path, expected) => {
    expect(authMethodOf(path)).toBe(expected);
  });
});
