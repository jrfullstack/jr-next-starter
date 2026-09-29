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

  it("treats NEXT_PUBLIC_GA_MEASUREMENT_ID as optional", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");

    const env = await loadEnv();

    expect(env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBeUndefined();
  });

  it("accepts a valid NEXT_PUBLIC_GA_MEASUREMENT_ID", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABC123XYZ");

    const env = await loadEnv();

    expect(env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("G-ABC123XYZ");
  });

  it("fails when NEXT_PUBLIC_GA_MEASUREMENT_ID has the wrong format", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "UA-12345-1");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });

  it("treats an empty DATABASE_URL as missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });
});
