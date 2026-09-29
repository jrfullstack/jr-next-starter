// Users created by e2e tests follow this pattern so global-teardown can delete them
const prefix = "e2e-";
const domain = "@example.com";

/** SQL LIKE pattern matching every e2e user email */
export const testUserEmailPattern = `${prefix}%${domain}`;

export function newTestUserEmail() {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${domain}`;
}
