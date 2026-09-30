// @vitest-environment node
// Node environment: server-only env vars are blocked by T3-env in jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

// Re-import so src/env.ts reads the stubbed variables
const loadOutbox = async () => {
  vi.resetModules();
  return import("./outbox");
};

describe("dev outbox", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is on in development and off in production unless CI opts in", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect((await loadOutbox()).isOutboxEnabled()).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect((await loadOutbox()).isOutboxEnabled()).toBe(false);

    vi.stubEnv("EMAIL_DEV_OUTBOX", "1");
    expect((await loadOutbox()).isOutboxEnabled()).toBe(true);
  });

  it("extracts the links of an email, decoding &amp;", async () => {
    const { extractLinks } = await loadOutbox();
    const html =
      '<a href="https://app.test/verify?token=abc&amp;callbackURL=%2Fes">Verify</a>';

    expect(extractLinks(html)).toEqual([
      "https://app.test/verify?token=abc&callbackURL=%2Fes",
    ]);
  });
});
