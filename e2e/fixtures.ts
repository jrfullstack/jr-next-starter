import { test as base } from "@playwright/test";

const octet = () => Math.floor(Math.random() * 254) + 1;

/**
 * Better Auth rate-limits per IP (x-forwarded-for): every test acts as a
 * different client, for both page navigation and API requests.
 */
export const test = base.extend({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixtures require the destructured first argument
  extraHTTPHeaders: async ({}, use) => {
    await use({ "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}` });
  },
});
