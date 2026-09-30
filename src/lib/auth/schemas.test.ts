import { describe, expect, it } from "vitest";
import { invalidFields, resetPasswordSchema, signUpSchema } from "./schemas";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  password: "12345678",
  confirmPassword: "12345678",
};

describe("signUpSchema", () => {
  it("accepts a valid sign-up", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("flags each invalid field, including a password mismatch", () => {
    const result = signUpSchema.safeParse({
      name: " ",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(invalidFields(result.error)).toEqual({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
  });
});

describe("resetPasswordSchema", () => {
  it("requires a long enough password confirmed twice", () => {
    const ok = resetPasswordSchema.safeParse({
      password: "12345678",
      confirmPassword: "12345678",
    });
    const mismatch = resetPasswordSchema.safeParse({
      password: "12345678",
      confirmPassword: "87654321",
    });

    expect(ok.success).toBe(true);
    expect(mismatch.success).toBe(false);
  });
});
