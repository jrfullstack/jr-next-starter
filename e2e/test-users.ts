import "dotenv/config";
import type { APIRequestContext } from "@playwright/test";
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
  { name = "E2E User", role }: { name?: string; role?: "admin" } = {},
) {
  const email = newTestUserEmail();
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
