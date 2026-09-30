import "dotenv/config";
import { type APIRequestContext, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import { env } from "@/env";

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
 * Returns the link, e.g. to check that it can't be used twice.
 */
export async function openEmailLink(page: Page, to: string) {
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
  return link ?? "";
}

/** Asks for a magic link on the sign-in page and opens it from the dev outbox */
export async function signInWithMagicLink(page: Page, email: string) {
  await page.goto("/es/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar enlace de acceso" }).click();
  await expect(page.locator("form").getByRole("status")).toContainText(email);
  return openEmailLink(page, email);
}

export async function signInAs(page: Page, email: string, password: string) {
  await page.goto("/es/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/es\/dashboard$/);
}
