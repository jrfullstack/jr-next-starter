import { z } from "zod";

/** Better Auth's default minimum; the System panel will make it configurable (step 4) */
export const PASSWORD_MIN_LENGTH = 8;

const newPasswordFields = {
  password: z.string().min(PASSWORD_MIN_LENGTH),
  confirmPassword: z.string(),
};

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

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.email(),
    ...newPasswordFields,
  })
  .refine(...passwordsMatch);

export const forgotPasswordSchema = z.object({ email: z.email() });

export const resetPasswordSchema = z
  .object(newPasswordFields)
  .refine(...passwordsMatch);

/** Form fields that can show a validation message (keys of Auth.validation in messages) */
export type AuthField = keyof z.input<typeof signUpSchema>;

/** First invalid field of each path, e.g. { email: true, confirmPassword: true } */
export function invalidFields(
  error: z.ZodError,
): Partial<Record<AuthField, true>> {
  const fields: Partial<Record<AuthField, true>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in signUpSchema.shape) {
      fields[field as AuthField] = true;
    }
  }
  return fields;
}
