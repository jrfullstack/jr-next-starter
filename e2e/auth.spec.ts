import { expect, test } from "@playwright/test";
import { newTestUserEmail } from "./test-users";

const user = {
  name: "Ada Lovelace",
  email: newTestUserEmail(),
  password: "correct-horse-battery",
};

test("protected pages redirect to sign-in and come back after it", async ({
  page,
}) => {
  await page.goto("/es/dashboard");

  await expect(page).toHaveURL(/\/es\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe(
    "/dashboard",
  );
});

test("sign up, sign out and sign in again", async ({ page }) => {
  await page.goto("/es/sign-up");
  await page.getByLabel("Nombre").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(user.password);
  await page.getByLabel("Confirmar contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/es\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    `Hola, ${user.name}`,
  );

  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/es$/);

  // Signing in from a protected page returns to it
  await page.goto("/es/dashboard");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill("wrong-password");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  // Scoped to the form: Next.js' route announcer also has role="alert"
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Email o contraseña incorrectos.",
  );

  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/es\/dashboard$/);
});
