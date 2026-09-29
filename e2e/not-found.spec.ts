import { expect, test } from "@playwright/test";

test("unknown pages show the translated 404 with a way back home", async ({
  page,
}) => {
  const response = await page.goto("/es/no-existe");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Página no encontrada" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(/\/es$/);
});
