import { expect } from "@playwright/test";
import { test } from "./fixtures";
import {
  createTestUser,
  fillNewPassword,
  setUpTwoFactor,
  signInAs,
  submitSignIn,
} from "./test-users";

const randomIp = () =>
  `10.${Math.floor(Math.random() * 254) + 1}.0.${Math.floor(Math.random() * 254) + 1}`;

test("a user changes the password, turns on 2FA and signs in with a code or a backup code", async ({
  page,
  request,
}) => {
  const user = await createTestUser(request);
  await signInAs(page, user.email, user.password);

  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Seguridad" }).click();
  await expect(page).toHaveURL(/\/es\/account\/security$/);
  const newPassword = "a-brand-new-password";
  await page.getByLabel("Contraseña actual").fill(user.password);
  await fillNewPassword(page, newPassword, "Cambiar contraseña");
  await expect(
    page.getByText("Contraseña cambiada.", { exact: false }),
  ).toBeVisible();

  const { secret, backupCodes } = await setUpTwoFactor(page, newPassword);

  // Next sign-in: the password is not enough, the app's code is needed
  await page.context().clearCookies();
  await signInAs(page, user.email, newPassword, { twoFactorSecret: secret });

  // Lost phone: a backup code works instead (once)
  await page.context().clearCookies();
  await submitSignIn(page, user.email, newPassword);
  await expect(page).toHaveURL(/\/es\/two-factor/);
  await page
    .getByRole("button", { name: "Usar un código de respaldo" })
    .click();
  await page.getByLabel("Código").fill(backupCodes[0] ?? "");
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page).toHaveURL(/\/es\/dashboard$/);
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
