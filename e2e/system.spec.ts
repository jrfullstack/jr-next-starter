import { expect, type Page } from "@playwright/test";
import { env } from "@/env";
import { test } from "./fixtures";
import {
  createSuperadmin,
  newTestUserEmail,
  signInAs,
  testPassword,
} from "./test-users";

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
