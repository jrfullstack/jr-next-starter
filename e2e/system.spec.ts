import { expect, type Page } from "@playwright/test";
import { env } from "@/env";
import { test } from "./fixtures";
import {
  createSuperadmin,
  createTestUser,
  newTestUserEmail,
  signInAs,
  signInWithMagicLink,
  testPassword,
} from "./test-users";

// Both tests change the same app-wide settings with the same superadmin
test.describe.configure({ mode: "serial" });

/** A switch inside one of the System cards (several cards have "Acceso") */
function settingSwitch(page: Page, card: string, name: string) {
  return page
    .locator("[data-slot=card]")
    .filter({ has: page.getByRole("heading", { name: card }) })
    .getByRole("switch", { name });
}

async function toggleRegistrations(page: Page) {
  await page.getByRole("switch", { name: "Permitir registros nuevos" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Configuración guardada.")).toBeVisible();
}

test("the superadmin closes and reopens registrations from System", async ({
  page,
  request,
  browser,
}) => {
  const superadmin = await createSuperadmin(request);
  await signInAs(page, superadmin.email, superadmin.password);
  await page.goto("/es/admin/system");

  await toggleRegistrations(page);
  await expect(
    page.getByText(
      "General · Permitir registros nuevos: activado → desactivado",
    ),
  ).toBeVisible();

  // Closed for real: the API refuses it, not only the page
  const signUp = await request.post("/api/auth/sign-up/email", {
    data: { name: "Nope", email: newTestUserEmail(), password: testPassword },
    headers: { origin: env.NEXT_PUBLIC_APP_URL },
  });
  expect(signUp.status()).toBe(400);

  const visitor = await browser.newPage();
  await visitor.goto("/es/sign-up");
  await expect(
    visitor.getByRole("heading", { name: "Registros cerrados" }),
  ).toBeVisible();
  await visitor.goto("/es/sign-in");
  await expect(visitor.getByRole("link", { name: "Regístrate" })).toHaveCount(
    0,
  );
  await visitor.close();

  await toggleRegistrations(page);
  await expect(
    page.getByText(
      "General · Permitir registros nuevos: desactivado → activado",
    ),
  ).toBeVisible();
});

test("password sign-in can be turned off while the magic link keeps working", async ({
  page,
  request,
  browser,
}) => {
  const user = await createTestUser(request);
  const superadmin = await createSuperadmin(request);
  await signInAs(page, superadmin.email, superadmin.password);
  await page.goto("/es/admin/system");

  const passwordAccess = settingSwitch(page, "Email y contraseña", "Acceso");
  await passwordAccess.click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  // Everyone can still use the magic link, so nobody is left out
  await expect(page.getByRole("alertdialog")).toContainText(
    "Ningún usuario depende solo de este método.",
  );
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Configuración guardada.")).toBeVisible();

  const signIn = await request.post("/api/auth/sign-in/email", {
    data: { email: user.email, password: user.password },
    headers: { origin: env.NEXT_PUBLIC_APP_URL },
  });
  expect(signIn.status()).toBe(403);

  const visitor = await browser.newPage();
  await visitor.goto("/es/sign-in");
  await expect(visitor.getByLabel("Contraseña", { exact: true })).toHaveCount(
    0,
  );
  await signInWithMagicLink(visitor, user.email);
  await expect(visitor).toHaveURL(/\/es\/dashboard$/);
  await visitor.close();

  await passwordAccess.click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    page.getByText("Email y contraseña · Acceso: desactivado → activado"),
  ).toBeVisible();
});
