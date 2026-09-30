import { describe, expect, it } from "vitest";
import { callbackErrorMessage } from "./errors";

describe("callbackErrorMessage", () => {
  it.each([
    [undefined, undefined],
    ["SIGN_IN_METHOD_DISABLED", "errors.signInMethodDisabled"],
    ["new_user_signup_disabled", "callbackErrors.noAccount"],
    ["signup_disabled", "callbackErrors.noAccount"],
    ["account_not_linked", "callbackErrors.accountNotLinked"],
    ["access_denied", "callbackErrors.cancelled"],
    ["INVALID_TOKEN", "callbackErrors.invalidLink"],
    ["something_else", "callbackErrors.generic"],
  ])("%s → %s", (error, expected) => {
    expect(callbackErrorMessage(error)).toBe(expected);
  });
});
