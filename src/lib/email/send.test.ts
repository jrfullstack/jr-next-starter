// @vitest-environment node
// Node environment: server-only env vars are blocked by T3-env in jsdom
import { describe, expect, it } from "vitest";
import { isReservedEmail } from "./send";

describe("isReservedEmail", () => {
  it.each([
    "e2e-123@example.com",
    "user@sub.example.org",
    "a@site.test",
    "a@invalid",
    "a@localhost",
  ])("never sends to the reserved address %s", (address) => {
    expect(isReservedEmail(address)).toBe(true);
  });

  it.each(["jrfullstack@gmail.com", "a@example.company.com", "a@mytest.com"])(
    "sends to the real address %s",
    (address) => {
      expect(isReservedEmail(address)).toBe(false);
    },
  );
});
