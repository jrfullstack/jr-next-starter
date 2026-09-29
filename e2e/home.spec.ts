import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads in Spanish", async ({ page }) => {
    await page.goto("/es");

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(
      page.getByRole("button", { name: "Cambiar tema" }),
    ).toBeVisible();
  });

  test("follows the system color scheme by default", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/es");

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("switches theme and keeps it after reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/es");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Cambiar tema" }).click();
    await page.getByRole("menuitem", { name: "Oscuro" }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Cambiar tema" }).click();
    await page.getByRole("menuitem", { name: "Claro" }).click();
    await expect(html).not.toHaveClass(/dark/);
  });
});
