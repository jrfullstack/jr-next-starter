import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Removes the users created by the tests */
  globalTeardown: "./e2e/global-teardown.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* On CI: annotate failures in the PR and keep the HTML report as an artifact */
  reporter: process.env.CI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : "html",
  /* On CI, stop before the job timeout (20 min) so failures are still reported */
  globalTimeout: process.env.CI ? 12 * 60_000 : undefined,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /system\.spec\.ts/,
    },
    /* Changes app-wide settings (e.g. closes registrations): runs alone, after the rest */
    {
      name: "system",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /system\.spec\.ts/,
      dependencies: ["chromium"],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Locally reuse `pnpm dev` if running; on CI serve the production build made by the Build step */
  webServer: {
    // On CI, run Next directly: pnpm 12's native binary doesn't forward the stop
    // signal on Linux, so Playwright's teardown would wait for a server that never exits
    command: process.env.CI
      ? "node node_modules/next/dist/bin/next start"
      : "pnpm dev",
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
