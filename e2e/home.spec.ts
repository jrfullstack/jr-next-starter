import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads in Spanish", async ({ page }) => {
    await page.goto("/es");

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(
      page.getByRole("button", { name: "Cambiar tema" }),
    ).toBeVisible();
  });

  test("shows the hero and the stack", async ({ page }) => {
    await page.goto("/es");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Arranca tu próximo proyecto en minutos",
      }),
    ).toBeVisible();
    const stack = page.getByRole("region", {
      name: "Todo lo que necesitas, ya configurado",
    });
    await expect(stack.getByRole("listitem")).toHaveCount(8);

    await page.getByRole("link", { name: "Ver el stack" }).click();
    await expect(page).toHaveURL(/#stack$/);
    await expect(stack).toBeInViewport();
  });

  test("has a header and footer", async ({ page }) => {
    await page.goto("/es");

    await expect(
      page.getByRole("link", { name: "Ir al inicio" }),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(
      "Hecho por Jimmy Reyes",
    );
  });

  test("uses the Geist font", async ({ page }) => {
    await page.goto("/es");

    const fontFamily = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/Geist/i);
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
