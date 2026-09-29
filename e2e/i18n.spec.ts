import { expect, test } from "@playwright/test";

test.describe("i18n", () => {
  test.describe("with an English browser", () => {
    test.use({ locale: "en-US" });

    test("redirects / to the browser language", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });

  // Also guards against the React <script> warning when the root layout remounts (next-themes#397)
  test("switches language without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/es");

    await page.getByRole("button", { name: "Cambiar idioma" }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Kick off your next project in minutes",
    );
    expect(errors).toEqual([]);
  });

  test("returns 404 for an unsupported locale", async ({ page }) => {
    const response = await page.goto("/fr");

    expect(response?.status()).toBe(404);
  });
});
