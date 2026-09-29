import { expect, test } from "@playwright/test";

test.describe("Not found page", () => {
  test("shows a translated 404 for unknown pages", async ({ page }) => {
    const response = await page.goto("/es/no-existe");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Página no encontrada" }),
    ).toBeVisible();
    // The site header is still available
    await expect(
      page.getByRole("link", { name: "Ir al inicio" }),
    ).toBeVisible();
  });

  test("is translated to English", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });

  test("links back to the home page", async ({ page }) => {
    await page.goto("/es/no-existe");

    await page.getByRole("link", { name: "Volver al inicio" }).click();

    await expect(page).toHaveURL(/\/es$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Arranca tu próximo proyecto en minutos",
    );
  });
});
