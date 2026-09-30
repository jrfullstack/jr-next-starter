// @vitest-environment node
// Node environment: server-only env vars are blocked by T3-env in jsdom
import { describe, expect, it } from "vitest";
import { assertPasskeyUserVerified } from "./passkey";

/** Authenticator data with only the flags byte set (32 bytes of rpIdHash first) */
function bodyWithFlags(flags: number) {
  const data = Buffer.alloc(37);
  data[32] = flags;
  return {
    response: { response: { authenticatorData: data.toString("base64url") } },
  };
}

describe("assertPasskeyUserVerified", () => {
  const path = "/passkey/verify-authentication";

  it("accepts a passkey that verified the user", () => {
    // user present (0x01) + user verified (0x04)
    expect(() =>
      assertPasskeyUserVerified(path, bodyWithFlags(0x05)),
    ).not.toThrow();
  });

  it.each([
    ["only user presence", bodyWithFlags(0x01)],
    ["no authenticator data", {}],
  ])("refuses %s", (_case, body) => {
    expect(() => assertPasskeyUserVerified(path, body)).toThrow(
      "The passkey didn't verify the user",
    );
  });

  it("ignores other endpoints", () => {
    expect(() => assertPasskeyUserVerified("/sign-in/email", {})).not.toThrow();
  });
});
