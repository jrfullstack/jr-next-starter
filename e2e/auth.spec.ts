import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import {
  createTestUser,
  newTestUserEmail,
  openEmailLink,
  testPassword as password,
  signInWithMagicLink,
} from "./test-users";

async function signUp(page: Page, email: string) {
  await page.goto("/es/sign-up");
  await page.getByLabel("Nombre").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tu email" }),
  ).toBeVisible();
}

async function signIn(page: Page, email: string, withPassword = password) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(withPassword);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/es$/);
}

// Scoped to the form: Next.js' route announcer also has role="alert"
const formAlert = (page: Page) => page.locator("form").getByRole("alert");

test("protected pages redirect to sign-in and come back after it", async ({
  page,
}) => {
  await page.goto("/es/dashboard");

  await expect(page).toHaveURL(/\/es\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe(
    "/dashboard",
  );
});

test("sign up requires verifying the email before signing in", async ({
  page,
}) => {
  const email = newTestUserEmail();
  await signUp(page, email);

  await page.goto("/es/sign-in");
  await signIn(page, email);
  await expect(formAlert(page)).toHaveText(
    "Tu email aún no está verificado. Te hemos enviado un nuevo enlace.",
  );

  // The fresh link sent on that sign-in attempt verifies and lands on the destination, signed in
  await openEmailLink(page, email);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hola, Ada Lovelace",
  );

  // Sign out, then signing in from a protected page returns to it
  await signOut(page);
  await page.goto("/es/dashboard");
  await signIn(page, email, "wrong-password");
  await expect(formAlert(page)).toHaveText("Email o contraseña incorrectos.");
  await signIn(page, email);
  await expect(page).toHaveURL(/\/es\/dashboard$/);
});

test("resetting a forgotten password from the email link also verifies the email", async ({
  page,
}) => {
  // Never verified: resetting through the emailed link must also verify the email
  const email = newTestUserEmail();
  await signUp(page, email);

  await page.goto("/es/sign-in");
  await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
  // Client-side navigation: wait for the new form before typing
  await expect(
    page.getByRole("heading", { name: "Recupera tu contraseña" }),
  ).toBeVisible();
  // The sign-in page stays in the DOM, hidden (<Activity>): use the visible field
  await page.getByLabel("Email").filter({ visible: true }).fill(email);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("te hemos enviado");

  const newPassword = "a-brand-new-password";
  await openEmailLink(page, email);
  await page.getByLabel("Contraseña", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirmar contraseña").fill(newPassword);
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Contraseña cambiada. Ya puedes iniciar sesión con la nueva.",
  );
  await signIn(page, email, newPassword);
  await expect(page).toHaveURL(/\/es\/dashboard$/);
});

test("signs in with a magic link, which works only once", async ({
  page,
  request,
}) => {
  const user = await createTestUser(request);

  const link = await signInWithMagicLink(page, user.email);
  await expect(page).toHaveURL(/\/es\/dashboard$/);

  // Links are single-use: opening it again lands on sign-in with the reason
  await signOut(page);
  await page.goto(link);
  await expect(page).toHaveURL(/\/es\/sign-in/);
  await expect(page.getByRole("status")).toHaveText(
    "El enlace no es válido, ya se usó o ha caducado. Pide otro.",
  );
});
