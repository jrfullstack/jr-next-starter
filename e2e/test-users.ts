import "dotenv/config";
import { type APIRequestContext, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import { env } from "@/env";
import { totp } from "./totp";

// Users created by e2e tests follow this pattern so global-teardown can delete them
const prefix = "e2e-";
const domain = "@example.com";

/** SQL LIKE pattern matching every e2e user email */
export const testUserEmailPattern = `${prefix}%${domain}`;

export const testPassword = "correct-horse-battery";

export function newTestUserEmail() {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${domain}`;
}

/** Runs SQL against the app database (pg directly: Playwright can't load the ESM Prisma client) */
export async function withDatabase<T>(run: (client: Client) => Promise<T>) {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

/**
 * Seeds a verified user through the real sign-up API, skipping the email step
 * (that flow has its own e2e). Optionally sets a role, like a seed script would.
 */
export async function createTestUser(
  request: APIRequestContext,
  {
    name = "E2E User",
    role,
    email = newTestUserEmail(),
  }: { name?: string; role?: "admin"; email?: string } = {},
) {
  const response = await request.post("/api/auth/sign-up/email", {
    data: { name, email, password: testPassword },
    // Better Auth checks the origin (CSRF) against the app URL
    headers: { origin: env.NEXT_PUBLIC_APP_URL },
  });
  if (!response.ok()) throw new Error(`Sign-up failed: ${response.status()}`);

  await withDatabase((db) =>
    db.query(
      'UPDATE "user" SET "emailVerified" = true, role = COALESCE($2, role) WHERE email = $1',
      [email, role ?? null],
    ),
  );
  return { name, email, password: testPassword };
}

/**
 * The e2e superadmin. Superadmin is computed from SUPER_ADMIN_EMAILS, so this
 * address must be listed there (CI does it; locally, add it to .env).
 */
const e2eSuperadminEmail = `${prefix}superadmin${domain}`;

export async function createSuperadmin(request: APIRequestContext) {
  if (!env.SUPER_ADMIN_EMAILS.includes(e2eSuperadminEmail)) {
    throw new Error(`Add ${e2eSuperadminEmail} to SUPER_ADMIN_EMAILS`);
  }
  // Left over by an interrupted run (global-teardown deletes it otherwise)
  await withDatabase((db) =>
    db.query('DELETE FROM "user" WHERE email = $1', [e2eSuperadminEmail]),
  );
  return createTestUser(request, {
    name: "E2E Superadmin",
    email: e2eSuperadminEmail,
  });
}

/**
 * Follows the Better Auth link of the latest email sent to `to`, read from the
 * dev outbox (emails are sent right after the response, so it may take a moment).
 * `subject` picks the email. Returns the link, e.g. to check that it can't be used twice.
 */
export async function openEmailLink(page: Page, to: string, subject: string) {
  let link: string | null = null;
  await expect(async () => {
    await page.goto("/es/dev/outbox");
    // The same address may have other emails (e.g. sign-up verification)
    link = await page
      .getByRole("listitem")
      .filter({ hasText: to })
      .filter({ has: page.getByRole("heading", { name: subject }) })
      .first()
      .locator('a[href*="/api/auth/"]')
      .first()
      .getAttribute("href");
    expect(link).toBeTruthy();
  }).toPass();
  await page.goto(link ?? "");
  return link ?? "";
}

/** Asks for a magic link on the sign-in page and opens it from the dev outbox */
export async function signInWithMagicLink(page: Page, email: string) {
  await page.goto("/es/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar enlace de acceso" }).click();
  await expect(page.locator("form").getByRole("status")).toContainText(email);
  return openEmailLink(page, email, "Tu enlace para entrar");
}

/**
 * Signs in with the password. With `twoFactorSecret`, also passes the second
 * step with a code generated like the user's authenticator app would.
 */
/** New password + confirmation, then the submit button (sign-up, reset, account security) */
export async function fillNewPassword(
  page: Page,
  password: string,
  submit: string,
) {
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña").fill(password);
  await page.getByRole("button", { name: submit }).click();
}

/** Fills the sign-in form and submits it with the password */
export async function submitSignIn(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/es/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

export async function signInAs(
  page: Page,
  email: string,
  password: string,
  { twoFactorSecret }: { twoFactorSecret?: string } = {},
) {
  await submitSignIn(page, email, password);
  if (twoFactorSecret) await passTwoFactor(page, twoFactorSecret);
  // Admins without 2FA land on Account → Security to set it up first
  await expect(page).toHaveURL(
    /\/es\/(dashboard|account\/security\?setup=2fa)$/,
  );
}

/** The /two-factor step: code from the authenticator app */
export async function passTwoFactor(page: Page, secret: string) {
  await expect(page).toHaveURL(/\/es\/two-factor/);
  await page.getByLabel("Código").fill(totp(secret));
  await page.getByRole("button", { name: "Verificar" }).click();
}

/**
 * Turns 2FA on from Account → Security like a user: confirms the password,
 * reads the key under the QR and verifies a first code. Returns the key (to
 * generate later codes) and the backup codes.
 */
export async function setUpTwoFactor(page: Page, password: string) {
  if (!page.url().includes("/account/security")) {
    await page.goto("/es/account/security");
  }
  await page.getByRole("button", { name: "Activar" }).click();
  await page.getByLabel("Confirma con tu contraseña").fill(password);
  await page.getByRole("button", { name: "Continuar" }).click();
  const secret = (await page.locator("code").textContent()) ?? "";
  await page.getByLabel("Código").fill(totp(secret));
  await page.getByRole("button", { name: "Verificar y activar" }).click();
  const codes = page.getByRole("list", { name: "Códigos de respaldo" });
  await expect(codes).toBeVisible();
  const backupCodes = await codes.getByRole("listitem").allTextContents();
  await page.getByRole("button", { name: "Hecho" }).click();
  await expect(
    page.getByText("Verificación en dos pasos activada."),
  ).toBeVisible();
  return { secret, backupCodes };
}

/** An admin (or superadmin) ready to use the panel: signed in and with 2FA set up, as required */
export async function signInAsAdmin(
  page: Page,
  user: { email: string; password: string },
) {
  await signInAs(page, user.email, user.password);
  // The redirect to set up 2FA streams in after the dashboard starts loading
  await expect(page).toHaveURL(/\/es\/account\/security\?setup=2fa$/);
  return setUpTwoFactor(page, user.password);
}
