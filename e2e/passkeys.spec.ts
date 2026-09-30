import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import { createTestUser, setUpTwoFactor, signInAs } from "./test-users";

/**
 * Chromium's virtual authenticator: a platform passkey that always verifies
 * the user (like a fingerprint), so no hardware is needed.
 */
async function addVirtualAuthenticator(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

async function addPasskey(page: Page, name: string) {
  await page.getByLabel("Nombre de la nueva passkey").fill(name);
  await page.getByRole("button", { name: "Añadir passkey" }).click();
  await expect(page.getByText("Passkey añadida.")).toBeVisible();
}

/** Signed out, then in with the passkey: lands on the dashboard, no 2FA step */
async function signInWithPasskey(page: Page) {
  await page.context().clearCookies();
  await page.goto("/es/sign-in");
  await page.getByRole("button", { name: "Entrar con passkey" }).click();
  await expect(page).toHaveURL(/\/es\/dashboard$/);
}

test("an admin signs in with a passkey: it counts as 2FA, and can be removed", async ({
  page,
  request,
}) => {
  await addVirtualAuthenticator(page);
  const admin = await createTestUser(request, { role: "admin" });

  // Password alone isn't enough for an admin: 2FA or a passkey is required
  await signInAs(page, admin.email, admin.password);
  await expect(page).toHaveURL(/\/es\/account\/security\?setup=2fa$/);
  await addPasskey(page, "Portátil");
  await expect(
    page.getByRole("list", { name: "Passkeys" }).getByText("Portátil"),
  ).toBeVisible();

  // Signing in with it: no second factor asked, and the panel opens
  await signInWithPasskey(page);
  await page.goto("/es/admin/users");
  await expect(page.getByRole("heading", { name: "Usuarios" })).toBeVisible();

  await page.goto("/es/account/security");
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Passkey eliminada.")).toBeVisible();
  await expect(page.getByText("Todavía no tienes passkeys.")).toBeVisible();
});

test("a user with 2FA signs in with a passkey without the second step", async ({
  page,
  request,
}) => {
  await addVirtualAuthenticator(page);
  const user = await createTestUser(request);
  await signInAs(page, user.email, user.password);
  await setUpTwoFactor(page, user.password);
  await addPasskey(page, "Móvil");

  // Straight in: device + fingerprint/PIN already are two factors
  await signInWithPasskey(page);
});
