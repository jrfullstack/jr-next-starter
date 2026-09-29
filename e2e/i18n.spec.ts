import { expect, test } from "@playwright/test";

test.describe("i18n routing", () => {
  test.describe("with a Spanish browser", () => {
    test.use({ locale: "es-ES" });

    test("redirects / to /es", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(/\/es$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
    });
  });

  test.describe("with an English browser", () => {
    test.use({ locale: "en-US" });

    test("redirects / to /en", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });

  test("renders English content on /en", async ({ page }) => {
    await page.goto("/en");

    await expect(page).toHaveTitle("JR Next Starter");
    await expect(
      page.getByRole("heading", {
        name: "To get started, edit the page.tsx file.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Toggle theme" }),
    ).toBeVisible();
  });

  test("switches language from the locale switcher", async ({ page }) => {
    await page.goto("/es");

    await page.getByRole("button", { name: "Cambiar idioma" }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("button", { name: "Change language" }),
    ).toBeVisible();
  });

  test("returns 404 for an unsupported locale", async ({ page }) => {
    const response = await page.goto("/fr");

    expect(response?.status()).toBe(404);
  });
});
