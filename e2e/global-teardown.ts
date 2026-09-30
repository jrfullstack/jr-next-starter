import { testUserEmailPattern, withDatabase } from "./test-users";

/**
 * Removes what the e2e run created: System changes made by test users (the
 * policy goes back to its defaults) and the users themselves (sessions and
 * accounts cascade).
 */
export default async function globalTeardown() {
  await withDatabase(async (db) => {
    const testUsers = 'SELECT id FROM "user" WHERE email LIKE $1';
    await db.query(
      `DELETE FROM system_setting WHERE "updatedById" IN (${testUsers})`,
      [testUserEmailPattern],
    );
    await db.query('DELETE FROM system_audit_log WHERE "actorEmail" LIKE $1', [
      testUserEmailPattern,
    ]);
    await db.query('DELETE FROM "user" WHERE email LIKE $1', [
      testUserEmailPattern,
    ]);
  });
}
