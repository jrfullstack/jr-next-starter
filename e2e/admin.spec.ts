import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import { createTestUser } from "./test-users";

async function signInAs(page: Page, email: string, password: string) {
  await page.goto("/es/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/es\/dashboard$/);
}

test("an admin blocks, unblocks and signs out a user from the panel", async ({
  page,
  request,
  browser,
}) => {
  const target = await createTestUser(request, { name: "Grace Hopper" });
  const admin = await createTestUser(request, { role: "admin" });
  await signInAs(page, admin.email, admin.password);

  // The user menu links to the panel; /admin opens the first section the role can see
  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Administración" }).click();
  await expect(page).toHaveURL(/\/es\/admin\/users$/);

  await page.getByLabel("Buscar por email").fill(target.email);
  await page.getByRole("button", { name: "Buscar" }).click();
  const row = page.getByRole("row").filter({ hasText: target.email });
  await expect(row).toContainText("Activo");

  await row.getByRole("button", { name: "Acciones de Grace Hopper" }).click();
  await page.getByRole("menuitem", { name: "Bloquear" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(row).toContainText("Bloqueado");

  // The blocked user can't sign in (a separate browser, as that person)
  const other = await browser.newPage();
  await other.goto("/es/sign-in");
  await other.getByLabel("Email").fill(target.email);
  await other.getByLabel("Contraseña", { exact: true }).fill(target.password);
  await other.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(other.locator("form").getByRole("alert")).toHaveText(
    "Tu cuenta está bloqueada. Contacta con el administrador.",
  );
  await other.close();

  await row.getByRole("button", { name: "Acciones de Grace Hopper" }).click();
  await page.getByRole("menuitem", { name: "Desbloquear" }).click();
  await expect(row).toContainText("Activo");

  // An admin can't change roles: that's reserved to the superadmin
  await row.getByRole("button", { name: "Acciones de Grace Hopper" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Hacer administrador" }),
  ).toHaveCount(0);
  await page.getByRole("menuitem", { name: "Cerrar sesiones" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
});

test("regular users get a 404 on the admin panel", async ({
  page,
  request,
}) => {
  const user = await createTestUser(request);
  await signInAs(page, user.email, user.password);

  const response = await page.goto("/es/admin/users");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Página no encontrada" }),
  ).toBeVisible();
});
