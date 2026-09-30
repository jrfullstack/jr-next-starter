import { expect, type Page, test } from "@playwright/test";
import { newTestUserEmail } from "./test-users";

const password = "correct-horse-battery";

/**
 * Follows the Better Auth link of the latest email sent to `to`, read from the
 * dev outbox (emails are sent right after the response, so it may take a moment).
 */
async function openEmailLink(page: Page, to: string) {
  let link: string | null = null;
  await expect(async () => {
    await page.goto("/es/dev/outbox");
    link = await page
      .getByRole("listitem")
      .filter({ hasText: to })
      .first()
      .locator('a[href*="/api/auth/"]')
      .first()
      .getAttribute("href");
    expect(link).toBeTruthy();
  }).toPass();
  await page.goto(link ?? "");
}

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

// Better Auth rate-limits per IP (x-forwarded-for): each test acts as a different client
test.beforeEach(async ({ page }) => {
  const octet = () => Math.floor(Math.random() * 254) + 1;
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}`,
  });
});

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
  await page.getByLabel("Email").fill(email);
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
