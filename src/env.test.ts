// @vitest-environment node
// Node environment: in jsdom T3-env would treat the code as client-side and block server vars
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Re-import src/env.ts on each test so validation runs with the stubbed vars
const loadEnv = async () => (await import("./env")).env;

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SKIP_ENV_VALIDATION", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes valid variables", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");

    const env = await loadEnv();

    expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
  });

  it("fails when DATABASE_URL is not a URL", async () => {
    vi.stubEnv("DATABASE_URL", "not-a-url");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });

  it("fails when NEXT_PUBLIC_APP_URL is not a URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "example.com");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });

  it("treats an empty DATABASE_URL as missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });
});
