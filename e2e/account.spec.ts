import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import {
  createTestUser,
  signInAs,
  signInWithMagicLink,
  withDatabase,
} from "./test-users";

async function fillNewPassword(page: Page, password: string) {
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña").fill(password);
}

const randomIp = () =>
  `10.${Math.floor(Math.random() * 254) + 1}.0.${Math.floor(Math.random() * 254) + 1}`;

test("a user without a password creates one, then changes it", async ({
  page,
  request,
}) => {
  // An account that only ever signed in with the magic link: no credential account
  const user = await createTestUser(request);
  await withDatabase((db) =>
    db.query(
      `DELETE FROM account WHERE "providerId" = 'credential'
         AND "userId" = (SELECT id FROM "user" WHERE email = $1)`,
      [user.email],
    ),
  );
  await signInWithMagicLink(page, user.email);
  await expect(page).toHaveURL(/\/es\/dashboard$/);

  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Seguridad" }).click();
  await expect(page).toHaveURL(/\/es\/account\/security$/);

  const first = "a-first-password";
  await fillNewPassword(page, first);
  await page.getByRole("button", { name: "Crear contraseña" }).click();
  await expect(page.getByText("Contraseña creada.")).toBeVisible();

  const second = "a-second-password";
  await page.getByLabel("Contraseña actual").fill(first);
  await fillNewPassword(page, second);
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();
  await expect(
    page.getByText("Contraseña cambiada.", { exact: false }),
  ).toBeVisible();

  await page.context().clearCookies();
  await signInAs(page, user.email, second);
});

test("signs out the other devices from the sessions list", async ({
  page,
  request,
  browser,
}) => {
  const user = await createTestUser(request);
  const laptop = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": randomIp() },
  });
  const other = await laptop.newPage();
  await signInAs(other, user.email, user.password);
  await signInAs(page, user.email, user.password);

  await page.goto("/es/account/security");
  await expect(page.getByText("Este dispositivo")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar las demás sesiones" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Se cerraron las demás sesiones.")).toBeVisible();

  // The other device lost its session: protected pages send it to sign-in
  await other.goto("/es/dashboard");
  await expect(other).toHaveURL(/\/es\/sign-in/);
  await laptop.close();
});
