import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { env } from "@/env";
import { test } from "./fixtures";
import {
  createSuperadmin,
  createTestUser,
  fillNewPassword,
  newTestUserEmail,
  passTwoFactor,
  setUpTwoFactor,
  signInAs,
  signInAsAdmin,
  signInWithMagicLink,
  testPassword,
  withDatabase,
} from "./test-users";

// These tests change app-wide settings with the same superadmin: one at a time
test.describe.configure({ mode: "serial" });

// CI has no Google credentials; locally the .env may have them
const googleConfigured = env.GOOGLE_CLIENT_ID !== undefined;

/** A switch inside one of the System cards (several cards have "Acceso") */
function settingSwitch(page: Page, card: string, name: string) {
  return page
    .locator("[data-slot=card]")
    .filter({ has: page.getByRole("heading", { name: card }) })
    .getByRole("switch", { name });
}

/** Sets switches in System and saves (confirming if a sign-in method goes off) */
async function saveSettings(
  page: Page,
  switches: [card: string, name: string, on: boolean][],
) {
  await page.goto("/es/admin/system");
  for (const [card, name, on] of switches) {
    const toggle = settingSwitch(page, card, name);
    if ((await toggle.getAttribute("aria-checked")) !== String(on)) {
      await toggle.click();
    }
  }
  const save = page.getByRole("button", { name: "Guardar cambios" });
  // The Server Action posts to the page itself
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/es/admin/system",
  );
  await save.click();
  const confirm = page.getByRole("alertdialog");
  if (await confirm.isVisible()) {
    await confirm.getByRole("button", { name: "Confirmar" }).click();
  }
  await saved;
  // The form matches the stored policy again (the button is also disabled while saving)
  await expect(save).toBeDisabled();
}

async function signInAsSuperadmin(page: Page, request: APIRequestContext) {
  const superadmin = await createSuperadmin(request);
  await signInAsAdmin(page, superadmin);
}

test("the superadmin closes and reopens registrations from System", async ({
  page,
  request,
  browser,
}) => {
  await signInAsSuperadmin(page, request);
  await page.goto("/es/admin/system");
  await expect(
    page
      .locator("[data-slot=card]")
      .filter({ has: page.getByRole("heading", { name: "Google" }) })
      .getByText("No configurado"),
  ).toHaveCount(googleConfigured ? 0 : 1);

  await saveSettings(page, [["General", "Permitir registros nuevos", false]]);
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
  // Signing in with Google stays: only its registration closes
  await expect(
    visitor.getByRole("button", { name: "Continuar con Google" }),
  ).toHaveCount(googleConfigured ? 1 : 0);
  await visitor.close();

  await saveSettings(page, [["General", "Permitir registros nuevos", true]]);
});

test("with the magic link on, passwords can be turned off and links work once", async ({
  page,
  request,
  browser,
}) => {
  const user = await createTestUser(request);
  await signInAsSuperadmin(page, request);
  await saveSettings(page, [
    ["Magic link", "Acceso", true],
    ["Email y contraseña", "Acceso", false],
  ]);

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
  const link = await signInWithMagicLink(visitor, user.email);
  await expect(visitor).toHaveURL(/\/es\/dashboard$/);
  // Single use: opening it again lands on sign-in with the reason
  await visitor.context().clearCookies();
  await visitor.goto(link);
  await expect(visitor.getByRole("status")).toHaveText(
    "El enlace no es válido, ya se usó o ha caducado. Pide otro.",
  );
  await visitor.close();

  await saveSettings(page, [
    ["Email y contraseña", "Acceso", true],
    ["Magic link", "Acceso", false],
  ]);
});

test("magic link sign-ins also ask for 2FA, and passwordless users can add a password", async ({
  page,
  request,
  browser,
}) => {
  const withTwoFactor = await createTestUser(request);
  const passwordless = await createTestUser(request);
  // Only ever signed in with the magic link: no credential account
  await withDatabase((db) =>
    db.query(
      `DELETE FROM account WHERE "providerId" = 'credential'
         AND "userId" = (SELECT id FROM "user" WHERE email = $1)`,
      [passwordless.email],
    ),
  );
  await signInAsSuperadmin(page, request);
  await saveSettings(page, [["Magic link", "Acceso", true]]);

  const first = await browser.newPage();
  await signInAs(first, withTwoFactor.email, withTwoFactor.password);
  const { secret } = await setUpTwoFactor(first, withTwoFactor.password);
  await first.context().clearCookies();
  await signInWithMagicLink(first, withTwoFactor.email);
  await passTwoFactor(first, secret);
  await expect(first).toHaveURL(/\/es\/dashboard$/);
  await first.close();

  const second = await browser.newPage();
  await signInWithMagicLink(second, passwordless.email);
  await second.goto("/es/account/security");
  await fillNewPassword(second, testPassword, "Crear contraseña");
  await expect(second.getByText("Contraseña creada.")).toBeVisible();
  await second.context().clearCookies();
  await signInAs(second, passwordless.email, testPassword);
  await second.close();

  await saveSettings(page, [["Magic link", "Acceso", false]]);
});
