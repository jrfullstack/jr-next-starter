import { expect, test } from "@playwright/test";

// Local and CI runs have no NEXT_PUBLIC_GA_MEASUREMENT_ID: Analytics must stay off
test("does not load Google Analytics without a measurement ID", async ({
  page,
}) => {
  const gaRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("googletagmanager.com")) {
      gaRequests.push(request.url());
    }
  });

  await page.goto("/es");
  await page.waitForLoadState("networkidle");

  expect(gaRequests).toEqual([]);
  expect(await page.evaluate(() => "gtag" in window)).toBe(false);
});
