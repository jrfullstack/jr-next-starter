import { expect, test } from "@playwright/test";

// Local and CI runs have no GA measurement ID and are not on Vercel: no tracking scripts must load
test("does not load analytics scripts outside production platforms", async ({
  page,
}) => {
  const trackingRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("googletagmanager.com") || url.includes("/_vercel/")) {
      trackingRequests.push(url);
    }
  });

  await page.goto("/es");
  await page.waitForLoadState("networkidle");

  expect(trackingRequests).toEqual([]);
  expect(await page.evaluate(() => "gtag" in window)).toBe(false);
});
