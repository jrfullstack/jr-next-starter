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

  await page.getByLabel("Buscar por nombre o email").fill(target.email);
  await page.getByRole("button", { name: "Filtrar" }).click();
  const row = page.getByRole("row").filter({ hasText: target.email });
  await expect(row).toContainText("Activo");

  await row.getByRole("button", { name: "Acciones de Grace Hopper" }).click();
  await page.getByRole("menuitem", { name: "Bloquear" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(row).toContainText("Bloqueado");

  // Status filter runs on the server: blocked shows them, active doesn't
  const statusFilter = page.getByLabel("Estado");
  await statusFilter.selectOption({ label: "Activo" });
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByText("No hay usuarios que coincidan.")).toBeVisible();
  await statusFilter.selectOption({ label: "Bloqueado" });
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(row).toContainText("Bloqueado");
  // Back to every status (keeping the search), or unblocking would hide the row
  await statusFilter.selectOption({ label: "Todos los estados" });
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page).not.toHaveURL(/status=/);

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

test("the users list sorts by column on the server", async ({
  page,
  request,
}) => {
  const token = Date.now().toString(36);
  await createTestUser(request, { name: `Sort B ${token}` });
  await createTestUser(request, { name: `Sort A ${token}` });
  const admin = await createTestUser(request, { role: "admin" });
  await signInAs(page, admin.email, admin.password);

  await page.goto(`/es/admin/users?q=${token}`);
  const firstRow = page.getByRole("row").nth(1);
  await page.getByRole("link", { name: "Ordenar por Nombre" }).click();
  await expect(page).toHaveURL(/sort=name&order=asc/);
  await expect(firstRow).toContainText(`Sort A ${token}`);
  await page.getByRole("link", { name: "Ordenar por Nombre" }).click();
  await expect(page).toHaveURL(/sort=name&order=desc/);
  await expect(firstRow).toContainText(`Sort B ${token}`);
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
