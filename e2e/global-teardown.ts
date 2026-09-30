import { testUserEmailPattern, withDatabase } from "./test-users";

/** Deletes the users created by the e2e run (sessions and accounts cascade) */
export default async function globalTeardown() {
  await withDatabase((db) =>
    db.query('DELETE FROM "user" WHERE email LIKE $1', [testUserEmailPattern]),
  );
}
