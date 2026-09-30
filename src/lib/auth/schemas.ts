import { z } from "zod";

/*
 * Forms that set a password take the minimum from the auth policy
 * (Admin → System), read on the server and passed down to the form.
 */

function newPasswordFields(minPasswordLength: number) {
  return {
    password: z.string().min(minPasswordLength),
    confirmPassword: z.string(),
  };
}

const passwordsMatch: [
  (data: { password: string; confirmPassword: string }) => boolean,
  { path: string[] },
] = [
  (data) => data.password === data.confirmPassword,
  { path: ["confirmPassword"] },
];

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export function signUpSchema(minPasswordLength: number) {
  return z
    .object({
      name: z.string().trim().min(1),
      email: z.email(),
      ...newPasswordFields(minPasswordLength),
    })
    .refine(...passwordsMatch);
}

/** Forms that only ask for the email: forgot password, magic link */
export const emailSchema = z.object({ email: z.email() });

/** Magic link sign-up: the name is stored if the link creates the account */
export const magicLinkSignUpSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
});

/** Admin panel: new account (it verifies its email on first sign-in) */
export function createUserSchema(minPasswordLength: number) {
  return z.object({
    name: z.string().trim().min(1),
    email: z.email(),
    password: z.string().min(minPasswordLength),
  });
}

export function resetPasswordSchema(minPasswordLength: number) {
  return z
    .object(newPasswordFields(minPasswordLength))
    .refine(...passwordsMatch);
}

const authFields = ["name", "email", "password", "confirmPassword"] as const;

/** Form fields that can show a validation message (keys of Auth.validation in messages) */
export type AuthField = (typeof authFields)[number];

function isAuthField(field: unknown): field is AuthField {
  return authFields.some((known) => known === field);
}

/** First invalid field of each path, e.g. { email: true, confirmPassword: true } */
export function invalidFields(
  error: z.ZodError,
): Partial<Record<AuthField, true>> {
  const fields: Partial<Record<AuthField, true>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (isAuthField(field)) fields[field] = true;
  }
  return fields;
}
