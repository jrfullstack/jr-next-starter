import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the hero and the stack section", async ({ page }) => {
    await page.goto("/es");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Arranca tu próximo proyecto en minutos",
    );
    const stack = page.getByRole("region", {
      name: "Todo lo que necesitas, ya configurado",
    });
    await expect(stack.getByRole("listitem")).toHaveCount(8);
  });

  // Regression: shadcn init once left --font-sans pointing to itself (Times instead of Geist)
  test("uses the Geist font", async ({ page }) => {
    await page.goto("/es");

    const fontFamily = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/Geist/i);
  });

  test("follows the system theme and persists the chosen one", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/es");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Cambiar tema" }).click();
    await page.getByRole("menuitem", { name: "Claro" }).click();
    await expect(html).not.toHaveClass(/dark/);

    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });
});
