import "dotenv/config";
import { Client } from "pg";
import { env } from "@/env";
import { testUserEmailPattern } from "./test-users";

/**
 * Deletes the users created by the e2e run (sessions and accounts cascade).
 * Uses `pg` directly: Playwright loads TS as CommonJS and the generated Prisma client is ESM.
 */
export default async function globalTeardown() {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('DELETE FROM "user" WHERE email LIKE $1', [
      testUserEmailPattern,
    ]);
  } finally {
    await client.end();
  }
}
