import { expect, test } from "@playwright/test";

test.describe("SEO", () => {
  test("serves robots.txt pointing to the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  });

  test("serves a sitemap with every locale", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toMatch(/<loc>https?:\/\/.+\/es<\/loc>/);
    expect(body).toMatch(/<loc>https?:\/\/.+\/en<\/loc>/);
    expect(body).toContain('hreflang="x-default"');
  });

  test("home has canonical, hreflang and Open Graph tags", async ({ page }) => {
    await page.goto("/en");
    const head = page.locator("head");

    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/en$/,
    );
    for (const lang of ["es", "en", "x-default"]) {
      await expect(
        head.locator(`link[rel="alternate"][hreflang="${lang}"]`),
      ).toHaveCount(1);
    }
    await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "en_US",
    );
    await expect(
      head.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", /Next\.js 16/);
  });

  test("generates the Open Graph image", async ({ page, request }) => {
    await page.goto("/es");
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toBeTruthy();

    // Request by path: the absolute URL uses NEXT_PUBLIC_APP_URL, which may differ from the test port
    const { pathname, search } = new URL(ogImage as string);
    const response = await request.get(pathname + search);

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toBe("image/png");
  });
});
