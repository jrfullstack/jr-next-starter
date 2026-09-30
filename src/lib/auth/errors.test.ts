import { describe, expect, it } from "vitest";
import { magicLinkErrorMessage } from "./errors";

describe("magicLinkErrorMessage", () => {
  it.each([
    [undefined, undefined],
    ["SIGN_IN_METHOD_DISABLED", "errors.signInMethodDisabled"],
    ["new_user_signup_disabled", "magicLink.linkErrors.noAccount"],
    ["INVALID_TOKEN", "magicLink.linkErrors.invalid"],
  ])("%s → %s", (error, expected) => {
    expect(magicLinkErrorMessage(error)).toBe(expected);
  });
});
