import { expect, test } from "@playwright/test";

// robots.txt and sitemap.xml content is covered by unit tests (src/app/sitemap.test.ts)
test.describe("SEO", () => {
  test("pages have canonical, hreflang and Open Graph tags", async ({
    page,
  }) => {
    await page.goto("/en");
    const head = page.locator("head");

    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/en$/,
    );
    await expect(head.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      3,
    );
    await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "en_US",
    );
  });

  test("generates the Open Graph image", async ({ page, request }) => {
    await page.goto("/es");
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    // Request by path: the absolute URL uses NEXT_PUBLIC_APP_URL, which may differ from the test port
    const { pathname, search } = new URL(ogImage ?? "");
    const response = await request.get(pathname + search);

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toBe("image/png");
  });
});
